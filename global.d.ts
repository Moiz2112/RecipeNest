import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: ReturnType<typeof MongoClient.prototype.connect> | undefined;
}

export {};

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.ico';
