import ballerina/http;
import ballerina/log;
// import ballerina/uuid;
import ballerina/sql;
// import ballerina/io;
import ballerina/time;
import ballerinax/github;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

configurable string GITHUB_TOKEN = ?;
configurable string HOST = ?;
configurable string USERNAME = ?;
configurable string PASSWORD = ?;
configurable string DATABASENAME = ?;
configurable int PORT = ?;

string gitHubOrg = "ESLE-Org";

string DEFAULT_TAG = "Not Specified";

string tagTableName = "Tags";

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
    string orgName;
    string createdAt;
    string tag;
    int monitorStatus;
    int repoWatchStatus;
|};

type TagItem record {|
    int id?;
    string name;
|};

service /analyse on new http:Listener(9090) {

    final mysql:Client databaseClient;

    public function init() returns error? {
        self.databaseClient = check new (HOST, USERNAME, PASSWORD, DATABASENAME, PORT);
        // _ = check self.databaseClient->execute(`CREATE TABLE BasicRepoDetails (
        //                                    id INT,
        //                                    repoName VARCHAR(255), 
        //                                    orgName VARCHAR(255), 
        //                                    createdAt VARCHAR(255), 
        //                                    tag VARCHAR(255), 
        //                                    monitorStatus INT, 
        //                                    repoWatchStatus INT,
        //                                    PRIMARY KEY (id)
        //                                  )`);

        // _ = check self.databaseClient->execute(`CREATE TABLE Repositories (
        //                                    id INT,
        //                                    repoName VARCHAR(255), 
        //                                    orgName VARCHAR(255), 
        //                                    description VARCHAR(255), 
        //                                    dbUpdatedAt VARCHAR(255),
        //                                    monitorStatus INT, 
        //                                    repoUrl VARCHAR(255), 
        //                                    updatedAt VARCHAR(255),
        //                                    PRIMARY KEY (id)
        //                                  )`);

        // _ = check self.databaseClient->execute(`CREATE TABLE Tags (
        //                                     id INT AUTO_INCREMENT,
        //                                     name VARCHAR(255), 
        //                                     PRIMARY KEY (id)
        //                                     )`);

        _ = check self.databaseClient->execute(`INSERT INTO Tags (name) VALUES (${DEFAULT_TAG});`);


    }

    resource function post addRepos/[string orgName]() returns string|error {
        // createDBnContainersIfNotExist(orgId);
        log:printInfo("Getting all repos...");

        github:MinimalRepository[] allOrgRepos = check githubEndpoint->/orgs/[orgName]/repos();

        foreach github:MinimalRepository repo in allOrgRepos {
            // log:printInfo("Repo is ");
            // log:printInfo(repo.toBalString());

            _ = check createDocumentFromRepoBasicDetails(self.databaseClient, repo, orgName, 0, 0, DEFAULT_TAG);

            _ = check createDocumentFromRepository(self.databaseClient, repo, orgName, 0);
        }

        return "success for api calling";
    }

    resource function put changeRepoBasicInfo/[int id]/[int repoWatchStatus]/[string tag]() returns http:Ok|error { //for tags
        // resource function put changeRepoBasicInfo(@http:Payload RepoBasicDetails repoDetails) returns http:Ok|error { //for tags
        log:printInfo("Changing Repo Basic Info...");

        // _ = check self.databaseClient->execute(`UPDATE BasicRepoDetails
        //                                         SET tag = ${repoDetails.tag}, repoWatchStatus = ${repoDetails.repoWatchStatus}
        //                                         WHERE id = ${repoDetails.id}
        //                                         `);

        _ = check self.databaseClient->execute(`UPDATE BasicRepoDetails
                                                SET tag = ${tag}, repoWatchStatus = ${repoWatchStatus}
                                                WHERE id = ${id}
                                                `);

        http:Ok response = {
            body: {
                "success": true,
                "data": "Changed Repo Basic Info"
            },
            headers: headers
        };
        return response;
    }
    resource function get getAllRepos/[string tagName]() returns http:Ok|error {
        json[] repoInfoList = [];
        stream<RepoItem, sql:Error?> itemStream = self.databaseClient->query(`SELECT * FROM BasicRepoDetails`);
        repoInfoList = check from RepoItem item in itemStream
            select item.toJson();
        http:Ok response = {
            body: repoInfoList,
            headers: headers
        };
        return response;
    }
    resource function post addTag/[string tagName]() returns error? {

        _ = check self.databaseClient->execute(`INSERT INTO Tags (name) VALUES (${tagName});`);

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

}

// resource function post .(@http:Payload RepoItem repoItem) returns error? {
//     _ = check self.databaseClient->execute(`INSERT INTO ${repoTableName} (repoName, orgName, createdAt, tag, monitorStatus, repoWatchStatus) VALUES (${repoItem.repoName}, ${repoItem.orgName}, ${repoItem.createdAt}, ${repoItem.tag}, ${repoItem.monitorStatus}, ${repoItem.repoWatchStatus});`);
// }

public function createDocumentFromRepoBasicDetails(mysql:Client databaseClient, github:MinimalRepository repository, string orgName, int repoWatchStatus, int monitorStatus, string tag) returns error? {

    _ = check databaseClient->execute(`INSERT INTO BasicRepoDetails (id, repoName, orgName, createdAt, tag, monitorStatus, repoWatchStatus) VALUES (
                                       ${repository["id"]}, ${repository["name"]}, ${orgName}, ${repository["created_at"]}, ${tag}, ${monitorStatus}, ${repoWatchStatus});`);

}

// //TODO: add feature to preserve monitor state and already open Prs
public function createDocumentFromRepository(mysql:Client databaseClient, github:MinimalRepository repository, string orgName, int monitorStatus) returns error? { // string orgId,   

    // string description = <string> repository["description"];

    _ = check databaseClient->execute(`INSERT INTO Repositories (id, repoName, orgName, description, dbUpdatedAt, monitorStatus, repoUrl, updatedAt) VALUES (
                                        ${repository["id"]}, ${repository["name"]}, ${orgName}, ${repository["description"]}, ${time:utcToString(time:utcNow()).toString()}, ${monitorStatus}, ${repository["html_url"]}, ${repository["updated_at"]});`);

    // json[] openPRs = [];
    // stream<github:PullRequest, github:Error?>|error streamResult = check githubEndpoint->pullRequest(orgName, repoName, "OPEN");
    // if streamResult is stream<github:PullRequest, github:Error?> {
    //     github:Error? err = streamResult.forEach(function(github:PullRequest pullRequest) 
    //         int prnum = pullRequest.number;
    //         github:PullRequest|github:Error pr = githubEndpoint->getPullRequest(orgName, repoName, prnum);
    //         if pr is github:PullRequest {
    //             OpenPR openPR = {
    //                 prNumber: prnum,
    //                 prUrl: pr.url.toString(),
    //                 lastCommit: pr.lastCommit.toJson()
    //             };
    //             openPRs.push(openPR.toJson());
    //         }
    //     });
    // }
    // map<json> newDocumentBody = {
    //                 openPRs: openPRs,
    //             };
    // return newDocumentBody;
}

public type RepositoryInfo record {
    string id;
    string description;
    string dbUpdatedAt;
    json[] languages;
    json[] openPRs;
    string orgId;
    string repoUrl;
    string repoName;
    int monitorStatus;
    string updatedAt;
};

public type RepoBasicDetails record {
    int id;
    int repoWatchStatus;
    string tag;
};

public type RepoUpdateInfo record {
    string id;
    string repoName;
    string orgId;
    int monitorStatus;
};

public type Language record {|
    string name;
    string id;
|};

public type LanguageInfo record {
    string id;
    string name;
    json[] testingTools;
    string orgId;
};

public type OpenPR record {
    int prNumber;
    string prUrl;
    json lastCommit;
};
