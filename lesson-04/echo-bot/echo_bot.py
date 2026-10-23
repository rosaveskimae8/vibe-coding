# Урок 4: Telegram-бот
# - текст -> отвечает тем же текстом задом наперёд (зеркальное эхо)
# - голосовое сообщение -> присылает расшифровку текстом

import os
import tempfile

import telebot
from faster_whisper import WhisperModel

# Токен берём из переменной окружения, чтобы он не попал в GitHub
TOKEN = os.environ["BOT_TOKEN"]
bot = telebot.TeleBot(TOKEN)

# Модель распознавания речи Whisper работает прямо на сервере, бесплатно.
# "base" — хороший баланс скорости и качества. Если сервер слабый — "tiny".
MODEL_SIZE = os.environ.get("WHISPER_MODEL", "base")
print(f"Загружаю модель распознавания речи ({MODEL_SIZE})...")
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")


# Ответ на команду /start
@bot.message_handler(commands=["start"])
def start(message):
    bot.reply_to(
        message,
        "Привет! Напиши текст — я отвечу задом наперёд.\n"
        "Отправь голосовое — я пришлю расшифровку текстом 🎤",
    )


# Зеркальное эхо: переворачиваем текст
# [::-1] читает строку с конца: "привет" -> "тевирп"
@bot.message_handler(content_types=["text"])
def echo(message):
    mirrored = message.text[::-1]
    bot.send_message(message.chat.id, mirrored)


# Голосовое сообщение (или аудиофайл) -> текст
@bot.message_handler(content_types=["voice", "audio"])
def voice(message):
    sound = message.voice or message.audio
    wait = bot.reply_to(message, "Слушаю… 🎧")

    try:
        # 1. Скачиваем голосовое с серверов Telegram
        file_info = bot.get_file(sound.file_id)
        data = bot.download_file(file_info.file_path)

        # 2. Сохраняем во временный файл и распознаём речь
        with tempfile.NamedTemporaryFile(suffix=".ogg") as f:
            f.write(data)
            f.flush()
            segments, info = model.transcribe(f.name, beam_size=1)
            text = " ".join(s.text.strip() for s in segments).strip()

        if not text:
            text = "Не получилось разобрать слова 🤔"
    except Exception as e:
        text = f"Ошибка при расшифровке: {e}"

    # 3. Заменяем «Слушаю…» на готовый текст
    bot.edit_message_text(text[:4096], message.chat.id, wait.message_id)


print("Бот запущен")
bot.infinity_polling()
