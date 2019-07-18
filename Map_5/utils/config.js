import env from '../env.json';

class Config {
  get(key) {
    return env[key];
  }
}
// class Config {
//   get(key) {
//     return "pk.eyJ1IjoibGVvbnloZW5uIiwiYSI6ImNqdzAxMTFvbjA2OTY0OWtzeTNnOTF5MWUifQ.UqGq-ZkOQ1kSR-TlVwET6A";
//   }
// }

const config = new Config();
export default config;
