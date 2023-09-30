let it: String = "Addson";
let age: number = 47;
let niver: Date = new Date(1976, 9, 16);

console.log(presentation(it, age, niver));

function presentation(it: String, age: number, niver: Date): string {

    return "Hi, that is " + it + " has " + age + " years old and his niver is " + niver;

}
