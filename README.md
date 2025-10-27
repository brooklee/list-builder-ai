This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You will need to get API key for the following and add them to a .env file to run the project
[SerpAPI homeDepot](https://serpapi.com/home-depot-product) 
[OpenAI API](https://openai.com/api/)

add them to the .env file as follows: 
OPENAI_API_KEY=xxx
SERPAPI_KEY=xxx


## More and FAQ

Why haven't you deployed this app? 
Money, currentley this app is using OpenAI's API and I do not have endless amounts of cash to run everyones query's it also is currentley running on serpAPI which I only get 250 calls per month for free. for future itereation I plan on using maybe playwright to scrape HomeDepot myself and i have looked into using Mistral AI which may be an option it tne future but for now SerpApi and OpenAPI work fine. 

But I want to test the App and try it myself.
Trust me Bro, it just works. but seriously if you want to run and test it you can follow the above steps and you will need to get your own env keys from SerpAPI and OpenAI to run. 

Why did you build this?
For one I am a scatter brain and always want to work on diffrent DIY projects all the time. I find build plans online that and want to try them. One thing i find particulaly frustarting is estimating how much a project will cost me. This is a quick way to decide if the project is still worth pusuing based on cost. I also wanted to expand my skills with AI and how to integrate it in web aplication. 

