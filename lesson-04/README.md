# Урок 4: Python

## echo-bot

Учебный Telegram-бот:
- на текст отвечает тем же текстом задом наперёд (привет → тевирп);
- голосовое сообщение расшифровывает в текст (распознавание речи Whisper прямо на сервере).

Запуск на сервере:

```
cd echo-bot
python3 -m venv venv
venv/bin/pip install -r requirements.txt
read -p "Токен: " BOT_TOKEN && export BOT_TOKEN && venv/bin/python echo_bot.py
```

Токен бота не хранится в коде и не загружается на GitHub.

### Чтобы бот работал всегда

Файл `echo-bot/echo-bot.service` запускает бота как службу на сервере:
бот работает, даже когда Termius закрыт, и сам включается после перезагрузки.

```
systemctl status echo-bot    # посмотреть, работает ли
systemctl restart echo-bot   # перезапустить после изменений в коде
journalctl -u echo-bot -n 20 # последние сообщения бота
```
