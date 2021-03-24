# Create Forgo App

Create Forgo App is the best way to start building a new single-page application in Forgo, and also makes it easy to start learning Forgo.

It sets up your development environment so that you can use the latest JavaScript features, provides a nice developer experience, and optimizes your app for production. You’ll need to have Node >= 10.16 and npm >= 5.6 on your machine. To create a project, run:

## Usage

```sh
npx create-forgo-app my-app
cd my-app
npm start
```

Create Forgo App doesn’t handle any backend services or data access; it just creates a frontend build pipeline, so you can use it with any backend you want.

To create a production build, use:

```sh
npm run build
```

## TypeScript

TypeScript is supported too.

```sh
npx create-forgo-app my-app --template typescript
cd my-app
npm start
```

## Other templates

A JavaScript template using webpack with babel-loader:

```sh
npx create-forgo-app my-app --template javascript-babel-loader
cd my-app
npm start
```

A TypeScript template using webpack with ts-loader:

```sh
npx create-forgo-app my-app --template typescript-ts-loader
cd my-app
npm start
```