import { detectLanguage } from '../utils/languageDetection';

/**
 * Test utility for language detection
 */
function testDetection() {
  const testCases = [
    {
      language: 'javascript',
      sample: `
        const greeting = "Hello world";
        function sayHello() {
          console.log(greeting);
        }
        const arrowFunc = () => {
          return 42;
        };
        document.querySelector('#app').innerHTML = greeting;
      `
    },
    {
      language: 'typescript',
      sample: `
        interface User {
          id: number;
          name: string;
          age?: number;
        }
        
        type UserResponse = Readonly<User>;
        
        const getUser = async (id: number): Promise<UserResponse> => {
          return { id, name: "John Doe" };
        };
      `
    },
    {
      language: 'python',
      sample: `
        def calculate_sum(numbers):
            return sum(numbers)
            
        class Person:
            def __init__(self, name, age):
                self.name = name
                self.age = age
                
            def greet(self):
                print(f"Hello, my name is {self.name}")
                
        if __name__ == "__main__":
            person = Person("Alice", 30)
            person.greet()
      `
    },
    {
      language: 'java',
      sample: `
        public class HelloWorld {
            private String greeting;
            
            public HelloWorld(String greeting) {
                this.greeting = greeting;
            }
            
            public void sayHello() {
                System.out.println(greeting);
            }
            
            public static void main(String[] args) {
                HelloWorld app = new HelloWorld("Hello, Java!");
                app.sayHello();
            }
        }
      `
    },
    {
      language: 'cpp',
      sample: `
        #include <iostream>
        #include <vector>
        #include <string>
        
        class Person {
        private:
            std::string name;
            int age;
            
        public:
            Person(std::string name, int age) : name(name), age(age) {}
            
            void sayHello() const {
                std::cout << "Hello, my name is " << name << std::endl;
            }
        };
        
        int main() {
            std::vector<int> numbers = {1, 2, 3, 4, 5};
            Person person("Alice", 30);
            person.sayHello();
            return 0;
        }
      `
    }
  ];

  console.log("===== Language Detection Test =====");
  
  let passedTests = 0;
  const totalTests = testCases.length;
  
  testCases.forEach(test => {
    const detected = detectLanguage(test.sample);
    const result = detected === test.language;
    
    console.log(`\nTesting ${test.language} detection:`);
    console.log(`Expected: ${test.language}`);
    console.log(`Detected: ${detected}`);
    console.log(`Result: ${result ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result) passedTests++;
  });
  
  console.log(`\n===== Test Summary =====`);
  console.log(`Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests * 100)}%)`);
}

// Run the test
testDetection();
