const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelper')
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});    

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () =>{
    console.log("Database connected")
})

const sample =(array)=>{
    return array[Math.floor(Math.random()*array.length)]
}
const seedDB = async()=>{
    await Campground.deleteMany({})
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000)
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '63ee6b3b0207efd89db39827',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{url: 'https://res.cloudinary.com/diiwbea7z/image/upload/v1676834817/YelpCamp/sfavbwwe6rhcqs9oodjj.webp',filename: 'sfavbwwe6rhcqs9oodjj'},{url: 'https://res.cloudinary.com/diiwbea7z/image/upload/v1676834473/YelpCamp/ia53srtl3ghfg0o9lznt.png', filename: 'ia53srtl3ghfg0o9lznt'}],
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officia, quos quasi asperiores odit animi distinctio a error minus doloremque iure nam exercitationem harum culpa dolores aperiam perspiciatis ipsam. Veritatis, recusandae.",
            price

        })
        await camp.save()
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
})