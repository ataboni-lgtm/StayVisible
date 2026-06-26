import type { Client } from './types';

export function clientDisplayName(client: Pick<Client, 'clientType' | 'company' | 'firstName' | 'lastName'>) {
  if (client.clientType === 'Company' && client.company.trim()) return client.company;
  return `${client.firstName} ${client.lastName}`.trim();
}

export function clientInitials(client: Pick<Client, 'clientType' | 'company' | 'firstName' | 'lastName'>) {
  const name = clientDisplayName(client);
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2)).toUpperCase();
}

export function clientRoleLine(client: Pick<Client, 'clientType' | 'company' | 'jobTitle'>) {
  if (client.clientType === 'Company') return client.jobTitle || 'Company LinkedIn presence';
  return [client.jobTitle, client.company].filter(Boolean).join(' at ');
}
