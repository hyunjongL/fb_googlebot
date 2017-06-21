# googlebot

### What is it?
Its a bot!
If you send a message to the facebook page you've connected to, you can get the "GOOGLE SEARCHED RESULTS" by message.
(At this moment)You'll get top10 links and some snippets(short explanations).
+ Based on Node.js, Uses https, fs, string_decoder

### But why not google it?
There are people who cannot connect to google, but can to facebook.
So, my AWS lambda serves as a broker!
It catches the word recieved by my FB page and queries using Google Search API.


How-to-use
  1. Get an AWS account, Google Custom Search API and a Facebook Page.
  2. Get a AWS Lambda and connect it to your Facebook page that the page interrupts Lambda when you recieve a message.
  3. Copy the index.js to your lambda server's code and enter YOUR_VARIABLES to the code.
  4. Try it out!
  
 * you should know that your google api's daily usage may be limited if you are not paying for it!





### Acknowledgements

Igor Khomenko

https://tutorials.botsfloor.com/run-facebook-messenger-chat-bot-on-aws-lambda-2fa800a67d76

- Skeleton of my code was from his tutorial.
