class ChatBus {
  private clients: Set<ReadableStreamDefaultController<any>> = new Set();

  addClient(client: ReadableStreamDefaultController<any>) {
    this.clients.add(client);
  }

  removeClient(client: ReadableStreamDefaultController<any>) {
    this.clients.delete(client);
  }

  broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((controller) => {
      try {
        controller.enqueue(new TextEncoder().encode(payload));
      } catch (e) {
        this.clients.delete(controller);
      }
    });
  }
}

const globalForChat = globalThis as unknown as { chatBus: ChatBus | undefined };
export const chatBus = globalForChat.chatBus ?? new ChatBus();
if (process.env.NODE_ENV !== "production") globalForChat.chatBus = chatBus;