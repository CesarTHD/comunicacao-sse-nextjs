import { NextRequest, NextResponse } from 'next/server';

interface Message {
  time: string;
  message: string;
}

// Armazena todas as mensagens do servidor, separadas por utm_source
const messageQueue: { [key: string]: Message[] } = {};

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const utm = req.nextUrl.searchParams.get('utm_source') || 'default';

  if (!messageQueue[utm]) {
    messageQueue[utm] = [];
  }

  // Aqui eu armazeno qual a última mensagem enviada para fazer o controle se estou:
  // - Enviando toda a fila de mensagens para uma nova conexão
  // - Enviando apenas a última mensagem para uma conexão já aberta
  let lastMessageIndex = 0;

  const sendMessage = (message: Message) => {
    const data = JSON.stringify(message);
    writer.write('event: meuEventoLegal\n');
    writer.write(`data: ${data}\n\n`);
  };

  const interval = setInterval(() => {
    if (messageQueue[utm].length > lastMessageIndex) {
      sendMessage(messageQueue[utm][lastMessageIndex]);
      lastMessageIndex++;
    }
  }, 1000);

  req.signal.onabort = () => {
    clearInterval(interval);
    writer.close();
  };

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Função chamada no endpoint /api/addMessage para incluir uma nova mensagem na fila do servidor
export function addMessageToQueue(utmSource: string, message: string) {
  const msg = {
    time: new Date().toISOString(),
    message,
  };

  if (!messageQueue[utmSource]) {
    messageQueue[utmSource] = [];
  }

  messageQueue[utmSource].push(msg);
}
