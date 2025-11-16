declare module 'qrcode' {
	// Minimal typings used in TicketService
	export function toDataURL(text: string, options?: any): Promise<string>;
}
