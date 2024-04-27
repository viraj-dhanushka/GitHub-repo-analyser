import ballerina/http;

// import ballerina/log;

configurable string GITHUB_SERVICE_API_URL = ?;

http:Client ghAnalyserApiEndpoint = check new (GITHUB_SERVICE_API_URL);

map<string|string[]> headers = {
    "Access-Control-Allow-Headers": "authorization,Access-Control-Allow-Origin,Content-Type,SOAPAction,Authorization,jwt,API-Key",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS"
};

service /analyse on new http:Listener(9090) {

    resource function post addRepos/[string orgName]() returns http:Response|error {
        string path = string `/addRepos/${orgName}`;
        return check ghAnalyserApiEndpoint->post(path = path, message = "", headers = headers);
    }

    resource function post addRepoByName/[string orgName]/[string repoName]() returns http:Response|error {

        string path = string `/addRepoByName/${orgName}/${repoName}`;
        return check ghAnalyserApiEndpoint->post(path = path, message = "", headers = headers);

    }

    resource function get getAllRepos/[string tagName]() returns http:Response|error {
        return check ghAnalyserApiEndpoint->/getAllRepos/[tagName];

    }

    resource function get getFavouriteRepos/[string tagName]() returns http:Response|error {
        return check ghAnalyserApiEndpoint->/getFavouriteRepos/[tagName];

    }

    resource function get getNonFavouriteRepos/[string tagName]() returns http:Response|error {
        return check ghAnalyserApiEndpoint->/getNonFavouriteRepos/[tagName];

    }
    resource function post addTag/[string tagName]() returns error? {

        string path = string `/addTag/${tagName}`;
        return check ghAnalyserApiEndpoint->post(path = path, message = "", headers = headers);

    }

    resource function put changeRepoWatchInfo/[int id]/[int repoFavStatus]/[string tag]() returns http:Response|error { //for tags
        // return check ghAnalyserApiEndpoint->/changeRepoWatchInfo/[id]/[repoFavStatus]/[tag];
        string path = string `/changeRepoWatchInfo/${id}/${repoFavStatus}/${tag}`;
        return check ghAnalyserApiEndpoint->put(path = path, message = "", headers = headers);

    }

    resource function get getTagsList() returns http:Response|error {

        return check ghAnalyserApiEndpoint->/getTagsList;

    }

    resource function delete deleteTag/[string tagName]() returns http:Response|error {

        string path = string `/deleteTag/${tagName}`;
        return check ghAnalyserApiEndpoint->delete(path = path, message = "", headers = headers);

    }

    resource function get fullRepository/[string orgName]/[string repoName]() returns http:Response|error {

        return check ghAnalyserApiEndpoint->/fullRepository/[orgName]/[repoName]();

    }

}
