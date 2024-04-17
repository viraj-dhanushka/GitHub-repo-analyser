
// import ballerina/http;
// import ballerina/sql;
// import ballerinax/mysql;
// import ballerinax/mysql.driver as _;

// type Item record {|
//     int id?;
//     string name;
//     int quantity;
// |};

// configurable string host = ?;
// configurable string username = ?;
// configurable string password = ?;
// configurable string databaseName = ?;
// configurable int port = ?;

// service /store on new http:Listener(9090) {
//     final mysql:Client databaseClient;

//     public function init() returns error? {
//         self.databaseClient = check new (host, username, password, databaseName, port);
//         // Create the ‘Students’ table with the ‘id’, 'age', and ‘name’ fields.
//         _ =
//                 check self.databaseClient->execute(`CREATE TABLE Inventory (
//                                            id INT AUTO_INCREMENT,
//                                            name VARCHAR(255), 
//                                            quantity INT, 
//                                            PRIMARY KEY (id)
//                                          )`);
//         // A value of the sql:ExecutionResult type is returned for 'result'. 
//     }
//     resource function get .() returns Item[]|error {
//         stream<Item, sql:Error?> itemStream = self.databaseClient->query(`SELECT * FROM Inventory`);
//         return from Item item in itemStream
//             select item;
//     }

//     resource function post .(@http:Payload Item item) returns error? {
//         _ = check self.databaseClient->execute(`INSERT INTO Inventory (name, quantity) VALUES (${item.name}, ${item.quantity});`);
//     }

//     resource function get liveness() returns http:Ok {
//         return http:OK;
//     }

//     resource function get readiness() returns http:Ok|error {
//         int _ = check self.databaseClient->queryRow(`SELECT COUNT(*) FROM Inventory`);
//         return http:OK;
//     }
// }
