// Note: I've created this as a seperate task. Feel free to combine it with the GitHub service as your requirement.

import ballerina/log;
import ballerina/sql;
import ballerinax/github;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

configurable string ORG_NAME = ?;
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

public function main() {
    final mysql:Client|sql:Error databaseClient = new (HOST, USERNAME, PASSWORD, DATABASENAME, PORT);

    github:MinimalRepository[]|error allOrgRepos = githubEndpoint->/orgs/[ORG_NAME]/repos();
    if (databaseClient is mysql:Client && allOrgRepos is github:MinimalRepository[]) {
        foreach github:MinimalRepository repo in allOrgRepos {
            log:printInfo("Repo is ");
            log:printInfo(repo.toBalString());

            string|error? result = insertTableDataFromMinimalRepository(databaseClient, repo, ORG_NAME, 0, 0, DEFAULT_TAG);
            if result is string {
                log:printInfo(result);
            } else {
                log:printError("Repo insertion not successful");
            }

        }
    }
}

public function insertTableDataFromMinimalRepository(mysql:Client databaseClient, github:MinimalRepository repository, string ORG_NAME, int repoFavStatus, int monitorStatus, string tag) returns string|error? {

    _ = check databaseClient->execute(`INSERT IGNORE INTO BasicRepoDetails (id, repoName, createdAt, repoUrl, description, tag, repoFavStatus) VALUES (
                                       ${repository["id"]}, ${repository["name"]}, ${repository["created_at"]}, ${repository["html_url"]}, ${repository["description"]}, ${tag}, ${repoFavStatus});`);
    return ("Repo insertion successful");
}
