import ballerina/http;
import ballerina/log;
import ballerina/sql;
import ballerinax/github;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

configurable string GITHUB_TOKEN = ?;
configurable string HOST = ?;
configurable string USERNAME = ?;
configurable string PASSWORD = ?;
configurable string DATABASENAME = ?;
configurable int PORT = ?;

string DEFAULT_TAG = "Not Specified";

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

type RepoItem record {|
    int id?;
    string repoName;
    string createdAt;
    string? description;
    string repoUrl;
    string tag;
    int repoFavStatus;
|};

type TagItem record {|
    string id;
    string name;
|};

service /ghanalyse on new http:Listener(9000) {

    final mysql:Client databaseClient;

    public function init() returns error? {
        self.databaseClient = check new (HOST, USERNAME, PASSWORD, DATABASENAME, PORT);
        _ = check self.databaseClient->execute(`CREATE TABLE IF NOT EXISTS BasicRepoDetails (
                                           id INT,
                                           repoName VARCHAR(255), 
                                           createdAt VARCHAR(255), 
                                           description VARCHAR(255),       
                                           repoUrl VARCHAR(255), 
                                           tag VARCHAR(255), 
                                           repoFavStatus INT,
                                           PRIMARY KEY (id)
                                         )`);

        _ = check self.databaseClient->execute(`CREATE TABLE IF NOT EXISTS Tags (
                                            id VARCHAR(255),
                                            name VARCHAR(255), 
                                            PRIMARY KEY (id)
                                            )`);

        _ = check self.databaseClient->execute(`INSERT IGNORE INTO Tags (id, name) VALUES (${DEFAULT_TAG.toLowerAscii()}, ${DEFAULT_TAG});`);

    }

    resource function post addRepos/[string orgName]() returns http:Ok|error {

        github:MinimalRepository[] allOrgRepos = check githubEndpoint->/orgs/[orgName]/repos();

        foreach github:MinimalRepository repo in allOrgRepos {
            log:printInfo("Repo is ");
            log:printInfo(repo.toBalString());

            _ = check insertTableDataFromMinimalRepository(self.databaseClient, repo, orgName, 0, 0, DEFAULT_TAG);

        }
        http:Ok response = {
            body: "API call success",
            headers: headers
        };
        return response;

    }

    resource function post addRepoByName/[string orgName]/[string repoName]() returns http:Ok|error {

        github:FullRepository repo = check githubEndpoint->/repos/[orgName]/[repoName]();

        _ = check insertTableDataFromFullRepository(self.databaseClient, repo, orgName, 0, 0, DEFAULT_TAG);

        http:Ok response = {
            body: "API call success",
            headers: headers
        };
        return response;

    }

    resource function get getAllRepos/[string tagName]() returns http:Ok|error {
        json[] repoInfoList = [];
        stream<RepoItem, sql:Error?> itemStream = self.databaseClient->query(`SELECT * FROM BasicRepoDetails WHERE tag = ${tagName}`);
        repoInfoList = check from RepoItem item in itemStream
            select item.toJson();
        http:Ok response = {
            body: repoInfoList,
            headers: headers
        };
        return response;
    }

    resource function get getFavouriteRepos/[string tagName]() returns http:Ok|error {
        json[] repoInfoList = [];
        stream<RepoItem, sql:Error?> itemStream = self.databaseClient->query(`SELECT * FROM BasicRepoDetails WHERE tag = ${tagName} AND repoFavStatus = 1`);
        repoInfoList = check from RepoItem item in itemStream
            select item.toJson();
        http:Ok response = {
            body: repoInfoList,
            headers: headers
        };
        return response;
    }

    resource function get getNonFavouriteRepos/[string tagName]() returns http:Ok|error {
        json[] repoInfoList = [];
        stream<RepoItem, sql:Error?> itemStream = self.databaseClient->query(`SELECT * FROM BasicRepoDetails WHERE tag = ${tagName} AND repoFavStatus = 0`);
        repoInfoList = check from RepoItem item in itemStream
            select item.toJson();
        http:Ok response = {
            body: repoInfoList,
            headers: headers
        };
        return response;
    }
    resource function post addTag/[string tagName]() returns http:Ok|error? {

        _ = check self.databaseClient->execute(`INSERT IGNORE INTO Tags (id, name) VALUES (${tagName.toLowerAscii()}, ${tagName});`);
        http:Ok response = {
            body: {
                "success": true,
                "data": "Added a new tag"
            },
            headers: headers
        };
        return response;
    }

    resource function put changeRepoWatchInfo/[int id]/[int repoFavStatus]/[string tag]() returns http:Ok|error { //for tags
        log:printInfo("Changing Repo Basic Info...");

        _ = check self.databaseClient->execute(`UPDATE BasicRepoDetails
                                                SET tag = ${tag}, repoFavStatus = ${repoFavStatus}
                                                WHERE id = ${id}`);

        http:Ok response = {
            body: {
                "success": true,
                "data": "Changed Repo Basic Info"
            },
            headers: headers
        };
        return response;
    }

    resource function get getTagsList() returns http:Ok|error {

        json[] tagList = [];
        stream<TagItem, sql:Error?> itemStream = self.databaseClient->query(`SELECT * FROM Tags`);
        tagList = check from TagItem item in itemStream
            select item.toJson();

        http:Ok response = {
            body: tagList,
            headers: headers
        };
        return response;
    }

    resource function delete deleteTag/[string tagName]() returns http:Ok|error {

        _ = check self.databaseClient->execute(`UPDATE BasicRepoDetails
                                                SET tag = ${DEFAULT_TAG}
                                                WHERE tag = ${tagName}`);

        _ = check self.databaseClient->execute(`DELETE FROM Tags WHERE name=${tagName};`);
        http:Ok response = {
            body: "Delete success",
            headers: headers
        };
        return response;
    }

    resource function get fullRepository/[string orgName]/[string repoName]() returns http:Ok|error {

        github:FullRepository fullRepository = check githubEndpoint->/repos/[orgName]/[repoName]();

        http:Ok response = {
            body: fullRepository.toJson(),
            headers: headers
        };
        return response;
    }

    // Implement other resource functions as you need, here ...

}

public function insertTableDataFromMinimalRepository(mysql:Client databaseClient, github:MinimalRepository repository, string orgName, int repoFavStatus, int monitorStatus, string tag) returns error? {

    _ = check databaseClient->execute(`INSERT IGNORE INTO BasicRepoDetails (id, repoName, createdAt, repoUrl, description, tag, repoFavStatus) VALUES (
                                       ${repository["id"]}, ${repository["name"]}, ${repository["created_at"]}, ${repository["html_url"]}, ${repository["description"]}, ${tag}, ${repoFavStatus});`);

}

public function insertTableDataFromFullRepository(mysql:Client databaseClient, github:FullRepository repository, string orgName, int repoFavStatus, int monitorStatus, string tag) returns error? {

    _ = check databaseClient->execute(`INSERT IGNORE INTO BasicRepoDetails (id, repoName, createdAt, repoUrl, description, tag, repoFavStatus) VALUES (
                                       ${repository["id"]}, ${repository["name"]}, ${repository["created_at"]}, ${repository["html_url"]}, ${repository["description"]}, ${tag}, ${repoFavStatus});`);

}
