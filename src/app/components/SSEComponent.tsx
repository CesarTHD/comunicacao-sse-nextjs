'use client';
import { useEffect, useState } from 'react';

interface Message {
  time: string;
  message: string;
}

const SSEComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnectionOpen, setIsConnectionOpen] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source') || '';
  const utmMedium = urlParams.get('utm_medium') || '';

  useEffect(() => {
    if (!isConnectionOpen) return;

    // Envio a utm do cliente para o servidor
    const es = new EventSource(`/api/sse?utm_source=${utmSource}&utm_medium=${utmMedium}`);

    // As mensagens recebidas são armazenadas em um state, podemos usar outra abordagem e 
    // armazenar apenas a última mensagem (como true ou false)a depender do caso de uso
    es.addEventListener("meuEventoLegal", (event) => {
      const newMessage: Message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Fechar a conexão após receber a mensagem ???
    });

    es.onerror = (error) => {
      console.error('EventSource error:', error);
      es.close();
      setIsConnectionOpen(false);
    };

    es.onopen = () => {
      console.log('Connection opened');
    };

    return () => {
      es.close();
    };
  }, [utmSource, utmMedium, isConnectionOpen]);

  return (
    <div>
      <h2>Mensagens do servidor:</h2>
      <ul className='mt-2'>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg.time}: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SSEComponent;
