let names = ["Alice", "John", "Nina", "Oscar", "Paula", "Robert", "Sarah", "Tom", "Vicky", "William", "Arnold", "Beth", "Chris", "David", "Emily", "Frank", "George", "Hannah", "Ian", "Julia", "Karen", "Larry", "Mark", "Nick", "Olivia", "Patrick", "Quincy", "Rosa", "Steve", "Tina"]

let ages =  [25, 52, 67, 21, 39, 32, 36, 19, 28, 42, 73, 48, 56, 61, 18, 22, 58, 53, 44, 29, 45, 49, 35, 26, 41, 55, 63, 70, 47, 34, 0]

let cities =  ["New York", "Las Vegas", "Houston", "Chicago", "Miami", "Boston", "Seattle", "Los Angeles", "Atlanta", "Philadelphia", "San Francisco", "Dallas", "San Diego", "Denver", "Portland", "Austin", "Detroit", "Raleigh", "St. Louis", "Orlando", "Charlotte", "Indianapolis", "Pittsburgh", "Tampa", "Minneapolis", "Columbus", "Nashville", "Memphis", "Cleveland"]

let states =  ["New York", "Nevada", "Texas", "Illinois", "Florida", "Massachusetts", "Washington", "California", "Georgia", "Pennsylvania", "California", "Texas", "California", "Colorado", "Oregon", "Texas", "Michigan", "North Carolina", "Missouri", "Florida", "North Carolina", "Indiana", "Pennsylvania", "Florida", "Minnesota", "Ohio", "Tennessee", "Tennessee", "Ohio"]

let pets = ["Dog", "Cat", "Hamster", "Fish", "Parrot", "Rabbit", "Snake", "Turtle", "Lizard", "Ferret", "Horse", "Goat", "Rat", "Mouse", "Bird", "Sheep", "Gerbil", "Guinea Pig", "Frog", "Crab", "Pig", "Chinchilla", "Bearded Dragon", "Duck", "Skunk", "Chickens", "Gecko", "Tortoise", "Ferret", "Hedgehog"]

let cars = ["Toyota", "Ford", "Honda", "Chevrolet", "Nissan", "Hyundai", "Kia", "Mazda", "Volkswagen", "Subaru", "Audi", "BMW", "Mercedes", "Lexus", "Jeep", "GMC", "Acura", "Dodge", "Ram", "Cadillac", "Infiniti", "Lincoln", "Buick", "Tesla", "Volvo", "Chrysler", "Jaguar", "Mitsubishi", "Mini"]

let jobs = ["Teacher", "Doctor", "Lawyer", "Accountant", "Engineer", "Nurse", "Programmer", "Journalist", "Architect", "Pharmacist", "Police Officer", "Carpenter", "Chef", "Writer", "Electrician", "Plumber", "IT Technician", "Painter", "Mechanic", "Gardener", "Cashier", "Barista", "Hairstylist", "Firefighter", "Designer", "Air Traffic Controller", "Dentist", "Actuary", "Real Estate Agent", "Social Worker"]

let hobbies = ["Reading", "Painting", "Photography", "Gardening", "Writing", "Cooking", "Hiking", "Yoga", "Jogging", "Dancing", "Golf", "Fishing", "Camping", "Biking", "Kayaking", "Surfing", "Sewing", "Bird Watching", "Rock Climbing", "Skateboarding", "Skiing", "Table Tennis", "Collecting", "Carpentry", "Bowling", "Board Games", "Knitting", "Painting", "Singing", "Martial Arts"]

let data = []
for (let i = 0; i < 1000; i++) {
    let obj = {}
    obj.name = names[Math.floor(Math.random() * names.length)]
    obj.age = Math.floor(Math.random() * 100);
    obj.city = cities[Math.floor(Math.random() * cities.length)]
    obj.state = states[Math.floor(Math.random() * states.length)]
    obj.pets = pets[Math.floor(Math.random() * pets.length)]
    obj.car = cars[Math.floor(Math.random() * cars.length)]
    obj.job = jobs[Math.floor(Math.random() * jobs.length)]
    obj.hobby = hobbies[Math.floor(Math.random() * hobbies.length)]
    data.push(obj)
}

const tableData = {
    columns: [
        {key: 'name', content: 'Name'},
        {key: 'age', content: 'Age'},
        {key: 'city', content: 'City'},
        {key: 'state', content: 'State'},
        {key: 'pets', content: 'Pets'},
        {key: 'car', content: 'Car', filtered: false},
        {key: 'job', content: 'Job'},
        {key: 'hobby', content: `Hobby`},
        // {key: 'hobby2', content: `Hobby`},
        // {key: 'hobb2y', content: `Hobby`},
        // {key: 'hobb23y', content: `Hobby`},
        // {key: 'ho6b4fby', content: `Hobby`},
        // {key: 'ho6b4bay', content: `Hobby`},
        // {key: 'ho6bx4by', content: `Hobby`},
        // {key: 'ho6bz4by', content: `Hobby`},
        // {key: 'ho6bz43by', content: `Hobby`},
        // {key: 'ho6b215z4by', content: `Hobby`},
        // {key: 'ho6bz44by', content: `Hobby`},
        // {key: 'ho6b1325z4by', content: `Hobby`},
        // {key: 'ho6bz2154by', content: `Hobby`},
        // {key: 'ho6b1325z4by', content: `Hobby`},
        // {key: 'ho6bz215521354by', content: `Hobby`},
        // {key: 'ho6b13252315z4by', content: `Hobby`},
        // {key: 'ho6bz2121362154by', content: `Hobby`},
        // {key: 'ho6b132215z4by', content: `Hobby`},
        // {key: 'ho6bz21235154by', content: `Hobby`},
        // {key: 'ho6b1312525z4by', content: `Hobby`},
        // {key: 'ho6135bz2154by', content: `Hobby`}
    ],
    rows: data
};

window.onload = function() {
    let tableContainer = document.createElement('div');
    tableContainer.classList.add('special-container');
    document.body.appendChild(tableContainer);
    let specialContainer = document.querySelector('.special-container');
    let table = new IrTableClassic(tableData.rows, tableData.columns, specialContainer, {pagination: 10, minWidth: '1000px', height: 'match', selectableRows: true});
    table.initialize();
}