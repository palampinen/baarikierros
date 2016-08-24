Baarikierros
=====================

![Baarikierros](https://raw.githubusercontent.com/palampinen/baarikierros/master/baarikierros.png)

Baarikierros is an app to check bars / restaurants / whatever locations on the go!

## How to start

```
git clone https://github.com/palampinen/baarikierros
cd baarikierros
npm install
ionic serve
```

`cp config.example.js config.js` and fill at least you firebase url. Steps for creating this url later in this document.

## Technologies

* Ionic Framework (AngularJS)
* Firebase

## How to Firebase

* Create new Firebase app in [Firebase console](https://console.firebase.google.com/)
Let's assume you created your app called `awesomeapp` so Firbase url for your app will be `https://awesomeapp.firebaseio.com`

* Go to your app console and choose **Database**
* You can create hierarchy for your app by creating child `/events`
* Create child for events, for example `/restaurantday`
* You **need to create child named** `/locations` where the webapp gets locations
* Create following format for each **location**:
```
name: 'Bronx Beer Deli'
address: 'Danger Street 123, New york'
category: 'bronx'
image: 'IMAGEURL'
lat: 61.123
lon: 25.321
```

![Firebase](https://raw.githubusercontent.com/palampinen/baarikierros/master/firebase-hierarchy.png)

After these steps your Firebase url for the app config should be:
`https://awesomeapp.firebaseio.com/events/restaurantday`


## DEMO

[baarikierros.top](http://baarikierros.top/)


## Licence

**MIT**