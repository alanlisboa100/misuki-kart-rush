# 🏁 Misuki Kart Rush (v2.0)

> **Jogo de corrida arcade 3D para Celular e Navegador com Three.js, física personalizada, 9 pistas, 12 pilotos e suporte a PWA.**

![Misuki Kart Rush](dist/icon-512.png)

---

## 🏎️ Destaques do Jogo

- **9 Pistas 3D:** Cenários variados com curvas, relevos, obstáculos e faixas de aceleração.
- **12 Pilotos e 6 Karts:** Personagens únicos e veículos customizáveis com atributos balanceados.
- **Oficina & Personalização:** Ajustes de pintura, carroceria, rodas e aerofólios.
- **Loja Integrada:** Compre novos pilotos e veículos usando moedas ganhas nas corridas.
- **Controles Responsivos:**
  - 📱 **Mobile:** Joystick touch virtual, freio, acelerador, botão de drift e turbo nitro.
  - 💻 **PC / Teclado:** `WASD` ou `Setas`, `Espaço` para Turbo, `Shift` para Drift e `Esc` para Pausa.
- **PWA Completo:** Instalável no Android e iOS, pronto para jogar offline.
- **Áudio & Efeitos:** Efeitos sonoros sintetizados via Web Audio API.

---

## 🚀 Como Executar Localmente

### Usando Python (Servidor Estático)
```bash
# Entre na pasta do projeto e inicie o servidor na pasta dist:
python3 -m http.server 8080 --directory dist
```
Abra no navegador: `http://localhost:8080`

### Usando Node.js / NPM
```bash
# Instalar dependências de build (se necessário)
npm ci

# Compilar assets e bundle
npm run build
```

---

## 🌐 Deploy no Vercel

O projeto conta com arquivo `vercel.json` pré-configurado apontando para a pasta `dist`.

Para implantar via Vercel CLI:
```bash
vercel --prod
```

---

## 📜 Licença
MIT © Misuki & BLACKCORE Team
Three.js incluído sob licença MIT.
