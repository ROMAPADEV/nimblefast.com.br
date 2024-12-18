
interface AddressDetails {
    id: number;
    postalCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    destinatario: string;
  }

   // Função principal para decidir o tipo de extração
export const extractDataByType = (text: string): AddressDetails => {
    if (text.includes('SHOPEE')) {
      return extractShopeeDetails(text);
    }
    return extractGenericDetails(text);
  };

  // Método de extração para etiquetas da Shopee
const extractShopeeDetails = (text: string): AddressDetails => {
    return {
      id: Date.now(),
      postalCode: extractMatch(text, /CEP:\s*(\d{5}-\d{3})/i) || '',
      street: extractMatch(text, /Rua\s([^\n,]+),?\s(\d+\w?)/i, 1) || '',
      number: extractMatch(text, /Rua\s([^\n,]+),?\s(\d+\w?)/i, 2) || '',
      complement: '',
      neighborhood: extractMatch(text, /Bairro:\s*([^\n]+)/i) || '',
      city: extractMatch(text, /,\s*(\w+),\s*([^\n]+)/i, 1) || '',
      state: extractMatch(text, /,\s*(\w+),\s*([^\n]+)/i, 2) || '',
      destinatario: extractMatch(text, /DESINATARIO\s*([^\n]+)/i) || '',
    };
  };

  // Método de extração para etiquetas genéricas
const extractGenericDetails = (text: string): AddressDetails => {
    return {
      id: Date.now(),
      postalCode: extractMatch(text, /CEP:\s*(\d{5}-\d{3}|\d{8})/i) || '',
      street: extractMatch(text, /Endereço:\s*(.+?)\s+(\d+)/i, 1) || '',
      number: extractMatch(text, /Endereço:\s*(.+?)\s+(\d+)/i, 2) || '',
      complement: '',
      neighborhood: extractMatch(text, /Bairro:\s*([^\n]+)/i) || '',
      city: extractMatch(text, /\b([A-Za-z\s]+?),\s*([A-Za-z]{2})\b/i, 1) || '',
      state: extractMatch(text, /\b([A-Za-z\s]+?),\s*([A-Za-z]{2})\b/i, 2) || '',
      destinatario: extractMatch(text, /Destinatario:\s*([^\n]+)/i) || '',
    };
  };

  // Função auxiliar para executar Regex e retornar grupos
const extractMatch = (text: string, regex: RegExp, group: number = 1): string | null => {
    const match = regex.exec(text);
    return match ? match[group].trim() : null;
  };