# Scunt3.0
Scunt Website 2T1 

# Table of Contents
- [Scunt3.0](#scunt30)
- [Table of Contents](#table-of-contents)
- [Running Locally](#running-locally)
    - [Running the Backend](#running-the-backend)
    - [Cleaning Back End Dependencies](#cleaning-back-end-dependencies)
    - [Running the Front End Client](#running-the-front-end-client)
    - [Hot Reload](#hot-reload)
    - [Cleaning Front End Dependencies](#cleaning-front-end-dependencies)
- [File Structure](#file-structure)
- [Component Documentation](#component-documentation)
- [Pages](#pages)
  - [Where to find them](#where-to-find-them)
  - [Admin](#admin)
    - [flaggd](#flaggd)
    - [judges](#judges)
    - [leedur](#leedur)
    - [missions](#missions)
    - [teams](#teams)
    - [dashboard](#dashboard)
  - [Frosh](#frosh)
    - [completedMissions](#completedmissions)
    - [submitMission](#submitmission)
    - [teamInfo](#teaminfo)
  - [Judge](#judge)
    - [judgingPanel](#judgingpanel)
    - [signupForm](#signupform)
  - [Main Pages](#main-pages)
  - [missions](#missions-1)
  - [judgesInfo, rules](#judgesinfo-rules)
  - [leaderboard](#leaderboard)
- [Routes](#routes)
- [Future Improvements](#future-improvements)
- [Support](#support)


# Running Locally
> Check `package.json` for more scripts to run
### Running the Backend
> Install Dependencies
```shell
$ cd .\
$ npm install
```

> Start server and serve static resources

```shell
$ npm run server 
```

> Start only the backend server

```shell
$ npm run start
```

### Cleaning Back End Dependencies

 ```shell 
$ npm run clean
```


### Running the Front End Client

> Install Frontend Dependencies 

```shell
$ cd client
$ npm install
```

> Spin up the react server (frontend only)

```shell
$ npm run start-client
```

or

> Spin up the react server (frontend only)

```shell
$ cd .\client\
$ npm start
```

### Hot Reload
First make sure you have all the dependencies. run `npm install` in client and root directories
1. open a terminal in the client folder and type `npm run watch` - this will rebuild your frontend code on save
2. open a separate terminal and type `npm start` in the root directory - this will run the backend server 

This is not the best solution, I think the best solution would be with webpack but building the frontend each time means we're working with optimized & compressed (production-level) code.

### Cleaning Front End Dependencies 

```shell
$ npm run client-clean
```


# File Structure
Root:
- `./client`: Frontend code
- `./config`: Top secret, don’t put on github
- `./models`: Data models
  - `EventSettings`: Single document that controls the start and end of the scunt event. 
    - If `startEvent` is enabled, the mission, submit, leaderboard pages will be open to frosh. Otherwise it will just show "The event hasn't started yet"
    - if `revealTeams` is enabled, frosh can see their scunt teams on either the frosh website or the scunt website
  - `Frosh`: Frosh schema, should mirror what we have in the frosh website repo
  - `Judge`: Judge schema, with initial 2500 bribe points
  - `Leedur`: Leedur schema for leedurs to use the website/discord
  - `Missions`: Just missions
  - `ScuntAdmin`: Admins that can approve leedurs and judges (tech team, scunt chairs)
  - `SubmittedMission`: Submitted items with mission info, team info, and statues
  - `Team`: Team scores and other necessary info
- `./routes`: Backend routes
- `./services`: Handles passport authentication functions (so it can be used easily in auth route)
- `./swagger`: Documentation and testing for the backend routes. Try them out by running the backend and going to [localhost:6969/api-docs](http://localhost:6969/api-docs)
- `./server.js`: Connect frontend and backend together

# Component Documentation
> Located in `./client/src/components`, which stores all the frontend components of the website

Most components are copied from the frosh website, you can check the documentation on that repo after running it locally (http://localhost:3000/documentation)

# Pages

## Where to find them
in `./client/src/util/pages.js`, you will find all the pages of this website and their links. Non-hidden page will be directly added to the navbar, and protected page will redirect users to log in if they first visit without logging in. 

## Admin

### flaggd
View flagged missions

### judges
View and approve judges

### leedur
View and approve leedurs

### missions
Upload missions from their google sheet (e.g. [2T1 Scunt Missions](https://docs.google.com/spreadsheets/d/1xDkTYs8LuB2MxTxWbX6c4N9nRq1eB3pGE7kxIXZuGXo/edit#gid=0)), set them to viewable.

A mission will only be viewable and submittable for frosh if **the event has started** AND **it's set to viewable** by the scunt admins. This allows certain missions such as royal wedding to be released later than other missions.

### teams
Upload teams from spreadsheet (e.g. [teams sheet](https://docs.google.com/spreadsheets/d/16pHJ-zPHcD-O31082k_aLgdUQIfwnhlXGTWIkQI_fB4/edit#gid=421509232)), start event, reveal teams, ...

### dashboard
[DEPRECATED] This used to be a combintation all the above pages, not used anymore

## Frosh
### completedMissions
A page that basically gets all the submitted missions and does a bunch of filtering to show frosh the status of each mission, which one they have done, and what scores they achieved
### submitMission
Allows frosh/leedurs to submit a mission on the scunt website 
### teamInfo
View team contacts and discord code here

## Judge
### judgingPanel
Another page that gets all the submitted missions and does a bunch of filtering to show the incomplete missions, and allow judging, screening to livestream, flagging, adding bribes, and in-person judging

Socket.io is connected here so that whenever a judge clicks on a mission, the status is updated to `judging` in the database and this reflects on every judge's device real-time.

### signupForm
This page and the leedur signup page are pretty straight forward: they allow leedurs and judges to sign up for an account


## Main Pages 
> pages that are not account specific, anyone can access.

## missions
Home page to display all the missions, with searching and filtering functionalities. This page doesn't show the mission status for any team

## judgesInfo, rules
Fancy frontend pages that shows some necessary scunt info

## leaderboard
Real-time updates of the leaderboard

# Routes
Some notable points: 
> Most routes should have been documented in swagger [localhost:6969/api-docs](http://localhost:6969/api-docs)

- Every year people try to hack the website, so make sure all relevant endpoints are protected and all inputs are validated
- The `participantRoutes` is the only file that integrates the discord endpoints. Commands such as login, check status, submit ... on discord are connected to the endpoints here.

# Future Improvements
- Judges and Leedurs (and frosh) sometimes don't read their guides :(. To help get them started easily, we should make the flow more clear with better error messages. For example: 
  - Frosh will try to log in as soon as they are invited to discord, however, they wouldn't be able to log in until: 
    - The bot has started (`errMsg: bot hasn't started`)
    - They get their discord code (`errMsg: invalid discord code w/ instructions on how to find the code`)
    - Wrong email (case sensitive) (`errMsg: please type in the correct email`)
  - Judges & Leedurs will try to log into discord too, but often times they haven't applied for an account yet. We need to let them know:
    - if they have requested an account w/ link to the signup form
    - if the account has been activated by scunt admins
    - link to guide if they have more questions
- Automate scunt team emails to frosh
  - This year all emails were sent manually by Scunt and Meetups
  - We can automate this process with an email template
  - **Note: there is a max limit on how many emails we can send per day. So you will need to figure out to send all emails across different days**
- Judge panel doesn't look the best when there are hundreds of pending submisisons. We should fix that
  - Because submissions are real time, the components move around a lot and you can lose track of your currently selected mission easily. We can try using a popup modal in the future.
  -  Maybe pagination
- Check if file is shared
  - Sometimes frosh submits a google drive link without making it viewable. We can explore ways to force them share the file before submitting
- Contact Meetups Subcom earlier than the week before F!rosh to figure out team assignments
- Add unit testing + integration tests

# Support

Reach out to me at one of the following places!

- Email us at tech@orientation.skule.ca

