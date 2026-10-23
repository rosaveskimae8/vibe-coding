# Урок 4: зеркальный эхо-бот для Telegram
# Бот отвечает тем же текстом, но задом наперёд.

import os
import telebot

# Токен берём из переменной окружения, чтобы он не попал в GitHub
TOKEN = os.environ["BOT_TOKEN"]
bot = telebot.TeleBot(TOKEN)


# Ответ на команду /start
@bot.message_handler(commands=["start"])
def start(message):
    bot.reply_to(message, "Привет! Я зеркальный эхо-бот. Напиши что-нибудь, и я отвечу задом наперёд.")


# Зеркальное эхо: переворачиваем текст
# [::-1] читает строку с конца: "привет" -> "тевирп"
@bot.message_handler(content_types=["text"])
def echo(message):
    mirrored = message.text[::-1]
    bot.send_message(message.chat.id, mirrored)


print("Бот запущен")
bot.infinity_polling()
