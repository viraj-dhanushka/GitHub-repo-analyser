import ballerina/http;
// import ballerina/time;
import ballerinax/github;


configurable string GITHUB_TOKEN = ?;

github:ConnectionConfig gitHubConfig = {
    auth: {
        token: GITHUB_TOKEN
    }
};

github:Client githubEndpoint = check new (gitHubConfig);
map<string|string[]> headers = {
    "Access-Control-Allow-Headers": "authorization,Access-Control-Allow-Origin,Content-Type,SOAPAction,Authorization,jwt,API-Key",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS"
};

service /github on new http:Listener(9000) {

    resource function get fullRepository/[string orgName]/[string repoName]() returns http:Ok|error {

        github:FullRepository fullRepository = check githubEndpoint->/repos/[orgName]/[repoName]();

        http:Ok response = {
            body: fullRepository.toJson(),
            headers: headers
        };
        return response;
    }



}
