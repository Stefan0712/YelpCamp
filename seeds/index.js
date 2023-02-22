const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const Campground = require('../models/campground');
 
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
 
const db = mongoose.connection;
 
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
 
const sample = array => array[Math.floor(Math.random() * array.length)];
 
 
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author: "63ee6b3b0207efd89db39827",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/diiwbea7z/image/upload/v1677073060/YelpCamp/i3gjikezpefglai75nc6.jpg',
                    filename: 'YelpCamp/i3gjikezpefglai75nc6'
                },
                {
                    url: 'https://res.cloudinary.com/diiwbea7z/image/upload/v1677073057/YelpCamp/nmxi9nfafqdfjlrmvcya.jpg',
                    filename: 'YelpCamp/nmxi9nfafqdfjlrmvcya'
                }
            ]
        })
        await camp.save();
    }
}
 
seedDB().then(() => {
    mongoose.connection.close();
})