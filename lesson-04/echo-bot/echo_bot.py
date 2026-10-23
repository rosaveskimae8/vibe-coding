# Урок 4: эхо-бот для Telegram
# Бот повторяет любое текстовое сообщение.

import os
import telebot

# Токен берём из переменной окружения, чтобы он не попал в GitHub
TOKEN = os.environ["BOT_TOKEN"]
bot = telebot.TeleBot(TOKEN)


# Ответ на команду /start
@bot.message_handler(commands=["start"])
def start(message):
    bot.reply_to(message, "Привет! Я эхо-бот. Напиши что-нибудь, и я повторю.")


# Эхо: отправляем обратно тот же текст
@bot.message_handler(content_types=["text"])
def echo(message):
    bot.send_message(message.chat.id, message.text)


print("Бот запущен")
bot.infinity_polling()
