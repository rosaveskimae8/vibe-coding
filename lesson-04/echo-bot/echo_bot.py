# Урок 4: Telegram-бот
# - текст -> отвечает тем же текстом задом наперёд (зеркальное эхо)
# - голосовое, аудиофайл, видео или кружок -> присылает расшифровку текстом
#   длинная расшифровка приходит файлом .txt

import io
import os
import tempfile
import time

import av
import numpy as np
import telebot
from faster_whisper import WhisperModel

# Токен берём из переменной окружения, чтобы он не попал в GitHub
TOKEN = os.environ["BOT_TOKEN"]
bot = telebot.TeleBot(TOKEN)

# Telegram разрешает ботам скачивать файлы только до 20 МБ
MAX_SIZE = 20 * 1024 * 1024
# Одно сообщение в Telegram — максимум 4096 символов
MAX_MESSAGE = 4000

# Модель распознавания речи Whisper работает прямо на сервере, бесплатно.
# "base" — хороший баланс скорости и качества. Если сервер слабый — "tiny".
MODEL_SIZE = os.environ.get("WHISPER_MODEL", "base")
print(f"Загружаю модель распознавания речи ({MODEL_SIZE})...")
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")


def load_audio(path):
    """Читаем звук сами: моно, 16 000 Гц — так, как нужно Whisper.
    Работает и с видео: берём из него только звуковую дорожку."""
    resampler = av.AudioResampler(format="s16", layout="mono", rate=16000)
    chunks = []
    with av.open(path) as container:
        for frame in container.decode(audio=0):
            for f in resampler.resample(frame):
                chunks.append(f.to_ndarray())
        for f in resampler.resample(None):
            chunks.append(f.to_ndarray())
    audio = np.concatenate(chunks, axis=1).flatten()
    return audio.astype(np.float32) / 32768.0


def minutes(seconds):
    """125 секунд -> "2:05" """
    seconds = int(seconds)
    return f"{seconds // 60}:{seconds % 60:02d}"


def transcribe(message, file_id, file_size):
    """Скачать файл, расшифровать и прислать текст."""
    chat_id = message.chat.id

    if file_size and file_size > MAX_SIZE:
        mb = file_size / 1024 / 1024
        bot.reply_to(
            message,
            f"Файл слишком большой ({mb:.0f} МБ) 😔\n"
            "Telegram даёт ботам скачивать файлы только до 20 МБ.\n"
            "Попробуй разрезать запись на части или сжать её.",
        )
        return

    wait = bot.reply_to(message, "Скачиваю… ⬇️")

    def status(text):
        try:
            bot.edit_message_text(text, chat_id, wait.message_id)
        except Exception:
            pass  # если текст не изменился, Telegram ругается — не страшно

    try:
        # 1. Скачиваем файл с серверов Telegram
        file_info = bot.get_file(file_id)
        data = bot.download_file(file_info.file_path)
        ext = os.path.splitext(file_info.file_path)[1] or ".ogg"

        with tempfile.NamedTemporaryFile(suffix=ext) as f:
            f.write(data)
            f.flush()
            del data
            status("Готовлю звук… 🎧")
            audio = load_audio(f.name)

        # 2. Распознаём речь по кусочкам и показываем прогресс
        total = len(audio) / 16000
        status(f"Слушаю… 🎧 (запись {minutes(total)})")
        segments, info = model.transcribe(audio, beam_size=1, vad_filter=True)

        parts = []
        last_update = time.time()
        for s in segments:
            parts.append(s.text.strip())
            if time.time() - last_update > 10:  # обновляем раз в 10 секунд
                percent = min(99, int(s.end / total * 100)) if total else 0
                status(f"Слушаю… 🎧 {percent}%  ({minutes(s.end)} из {minutes(total)})")
                last_update = time.time()

        text = " ".join(p for p in parts if p).strip()
    except Exception as e:
        status(f"Ошибка при расшифровке: {e}")
        return

    # 3. Отправляем результат
    if not text:
        status("Не получилось разобрать слова 🤔")
    elif len(text) <= MAX_MESSAGE:
        status(text)
    else:
        # Длинный текст не влезет в одно сообщение — отправляем файлом
        status(f"Готово ✅ Текст длинный ({len(text)} символов), отправляю файлом.")
        bot.send_document(
            chat_id,
            io.BytesIO(text.encode("utf-8")),
            visible_file_name="расшифровка.txt",
            caption=f"Расшифровка записи {minutes(total)}",
        )


# Ответ на команду /start
@bot.message_handler(commands=["start"])
def start(message):
    bot.reply_to(
        message,
        "Привет! Вот что я умею:\n"
        "✍️ Напиши текст — отвечу задом наперёд.\n"
        "🎤 Отправь голосовое, аудиофайл, видео или кружок — пришлю расшифровку.\n"
        "Длинную расшифровку пришлю файлом. Файлы — до 20 МБ.",
    )


# Зеркальное эхо: переворачиваем текст
# [::-1] читает строку с конца: "привет" -> "тевирп"
@bot.message_handler(content_types=["text"])
def echo(message):
    mirrored = message.text[::-1]
    bot.send_message(message.chat.id, mirrored)


# Голосовое, аудио, видео и кружок
@bot.message_handler(content_types=["voice", "audio", "video", "video_note"])
def media(message):
    m = message.voice or message.audio or message.video or message.video_note
    transcribe(message, m.file_id, m.file_size)


# Аудио, отправленное как файл (например .mp3 или .m4a через «Файл»)
@bot.message_handler(content_types=["document"])
def document(message):
    doc = message.document
    mime = doc.mime_type or ""
    if mime.startswith("audio/") or mime.startswith("video/"):
        transcribe(message, doc.file_id, doc.file_size)
    else:
        bot.reply_to(message, "Это не аудио 🙂 Пришли голосовое, аудио или видео.")


print("Бот запущен")
bot.infinity_polling()
