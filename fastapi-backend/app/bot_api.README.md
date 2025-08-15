curl -X POST https://n8n.rone.tw/webhook-test/ai-chat \
  -H "Content-Type: application/json" \
  -H 'X-API-Key:my_key' \
  -d '{"message": "你好，請用一句話自我介紹！"}'
  請依照此格式 url 用 .env CHAT_BOT_URL
  來建立後端api,再透過此api來串接前端 chat bot