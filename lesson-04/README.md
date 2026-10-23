# Урок 4: Python

## echo-bot

Учебный Telegram-бот с зеркальным эхом: отвечает тем же текстом задом наперёд (привет → тевирп).

Запуск на сервере:

```
cd echo-bot
python3 -m venv venv
venv/bin/pip install -r requirements.txt
read -p "Токен: " BOT_TOKEN && export BOT_TOKEN && venv/bin/python echo_bot.py
```

Токен бота не хранится в коде и не загружается на GitHub.
