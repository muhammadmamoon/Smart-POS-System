// console.log(myVar); // What happens?
// let myVar = 10;

// console.log(myConst); // What happens?
// const myConst = 20;

function testScope() {
    if (true) {
        let blockScoped = "Inside block";
        console.log(blockScoped);
    }
    console.log(blockScoped); // Will this work?
}
testScope();
