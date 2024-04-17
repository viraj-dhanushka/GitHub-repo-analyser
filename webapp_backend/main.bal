import ballerina/http;
import ballerina/log;
import ballerinax/github;
// import ballerina/io;
// import ballerina/time;
// import ballerina/uuid;
// import ballerina/sql;
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
string repoTableName = "Repositories";
string languagesTableName = "Languages";
string basicRepoDetailsTableName = "BasicRepoDetails";
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

public type RepoItem record {|
    int id?;
    string repoName;
    string orgName; 
    string createdAt;
    string tag;
    int monitorStatus;
    int repoWatchStatus;
|};

service /analyse on new http:Listener(9090) {

        final mysql:Client databaseClient;

    public function init() returns error? {
        self.databaseClient = check new (HOST, USERNAME, PASSWORD, DATABASENAME, PORT);
        _ = check self.databaseClient->execute(`CREATE TABLE BasicRepoDetails (
                                           id INT AUTO_INCREMENT,
                                           repoName VARCHAR(255), 
                                           orgName VARCHAR(255), 
                                           createdAt VARCHAR(255), 
                                           tag VARCHAR(255), 
                                           monitorStatus INT, 
                                           repoWatchStatus INT,
                                           PRIMARY KEY (id)
                                         )`);
        // A value of the sql:ExecutionResult type is returned for 'result'. 
    }

    resource function post addRepos/[string orgName]() returns string|error {
        // createDBnContainersIfNotExist(orgId);
        log:printInfo("Getting all repos...");

        github:MinimalRepository[] allOrgRepos = check githubEndpoint->/orgs/[orgName]/repos();

        foreach github:MinimalRepository repo in allOrgRepos {
            log:printInfo("Repo is ");
            log:printInfo(repo.toBalString());
            _ = check createDocumentFromRepoBasicDetails(self.databaseClient, repo, orgName, 0, 0, DEFAULT_TAG);
        }

        return "success for api calling";
    }

    resource function get liveness() returns http:Ok {
        return http:OK;
    }

    resource function get readiness() returns http:Ok|error {
        int _ = check self.databaseClient->queryRow(`SELECT COUNT(*) FROM Repositories`);
        return http:OK;
    }
    

        // stream<github:Repository, error?> getRepositoriesResponse = check githubEndpoint->repos/orgName/;
        // error? e = getRepositoriesResponse.forEach(function(github:Repository repository) {
        //     string repoId = repository["id"].toString();
        //     string repoName = repository["name"].toString();
        //     map<json> RepoBasicDetailsDocument = createDocumentFromRepoBasicDetails(repository, orgId, 0, 0, DEFAULT_TAG);
        //     cosmosdb:DocumentResponse|error docResponseStoreBasicDetails = azureCosmosClient->createDocument(databaseId, basicRepoDetailsContainerId,
        // repoId, RepoBasicDetailsDocument, orgId);
        //     if docResponseStoreBasicDetails is cosmosdb:DocumentResponse {
        //         github:Repository|github:Error repoWithAdditionalInfo = githubEndpoint->getRepository(orgName, repoName);
        //         if repoWithAdditionalInfo is github:Repository {
        //             map<json> RepositoryInfoDocument = createDocumentFromRepository(repoWithAdditionalInfo, orgName, orgId, 0);
        //             cosmosdb:DocumentResponse|error result = azureCosmosClient->createDocument(databaseId, repoContainerId,
        // repoId, RepositoryInfoDocument, orgId);
        //             addLanguagesToDbUsingRepoLanguages(RepositoryInfoDocument.get("languages"), databaseId, languagesContainerId, orgId);
        //         }
        //     }
        // });
        // if (e is error) {
        //     log:printInfo("Please RETRY again in few minitues...");
        //     return ("Please RETRY again in few minitues...");
        // } else {
        //     log:printInfo("Successfully imported all repos!");
        //     return ("Successfully imported all repos!");
        // }
    
}

    // resource function post .(@http:Payload RepoItem repoItem) returns error? {
    //     _ = check self.databaseClient->execute(`INSERT INTO ${repoTableName} (repoName, orgName, createdAt, tag, monitorStatus, repoWatchStatus) VALUES (${repoItem.repoName}, ${repoItem.orgName}, ${repoItem.createdAt}, ${repoItem.tag}, ${repoItem.monitorStatus}, ${repoItem.repoWatchStatus});`);
    // }

public function createDocumentFromRepoBasicDetails(mysql:Client databaseClient, github:MinimalRepository repository, string orgName, int repoWatchStatus, int monitorStatus, string tag) returns error? {
        
    _ = check databaseClient->execute(`INSERT INTO BasicRepoDetails (repoName, orgName, createdAt, tag, monitorStatus, repoWatchStatus) VALUES (
                                        ${repository["name"].toString()}, ${orgName}, ${repository["created_at"].toString()}, ${tag}, ${monitorStatus}, ${repoWatchStatus});`);
    
}

// //TODO: add feature to preserve monitor state and already open Prs
public function createDocumentFromRepository(github:MinimalRepository repository, string orgName, int monitorStatus) returns map<json> { // string orgId,   
    string repoName = repository["name"].toString();
    json languages = repository["languages"].toJson();
    json[] openPRs = [];
    stream<github:PullRequest, github:Error?>|error streamResult = githubEndpoint->getPullRequests(orgName, repoName, "OPEN");
    if streamResult is stream<github:PullRequest, github:Error?> {
        github:Error? err = streamResult.forEach(function(github:PullRequest pullRequest) {
            int prnum = pullRequest.number;
            github:PullRequest|github:Error pr = githubEndpoint->getPullRequest(orgName, repoName, prnum);
            if pr is github:PullRequest {
                OpenPR openPR = {
                    prNumber: prnum,
                    prUrl: pr.url.toString(),
                    lastCommit: pr.lastCommit.toJson()
                };
                openPRs.push(openPR.toJson());
            }
        });
    }
    map<json> newDocumentBody = {
                    description: repository["description"].toString(),
                    dbUpdatedAt: time:utcToString(time:utcNow()),
                    languages: languages,
                    monitorStatus: monitorStatus,
                    openPRs: openPRs,
                    orgId: orgId,
                    repoName: repository["name"].toString(),
                    repoUrl: repository["url"].toString(),
                    updatedAt: repository["updatedAt"].toString()
                };
    return newDocumentBody;
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
    string id;
    string createdAt;
    int monitorStatus;
    string orgId;
    string repoName;
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