// import ballerina/http;
// import ballerina/log;
// import ballerinax/azure_cosmosdb as cosmosdb;
// import ballerinax/github;
// import ballerina/io;
// import ballerina/time;
// import ballerina/uuid;
// import ballerina/sql;
// import ballerinax/mysql;
// import ballerinax/mysql.driver as _;

// configurable string COSMOS_DB_BASE_URL =?;
// configurable string PRIMARY_KEY = ?;
// configurable string GITHUB_TOKEN = ?;

// string DEFAULT_TAG = "Not Specified";
// string databaseId = "MonitoringToolDB";
// string repoContainerId = "Repositories";
// string languagesContainerId = "Languages";
// string basicRepoDetailsContainerId = "BasicRepoDetails";
// string tagContainerId = "Tags";

// cosmosdb:ConnectionConfig configuration = {
//     baseUrl: COSMOS_DB_BASE_URL,
//     primaryKeyOrResourceToken: PRIMARY_KEY
// };
// cosmosdb:DataPlaneClient azureCosmosClient = check new (configuration);
// cosmosdb:ManagementClient managementClient = check new (configuration);

// github:ConnectionConfig gitHubConfig = {
//     auth: {
//         token: GITHUB_TOKEN
//     }
// };
// github:Client githubEndpoint = check new (gitHubConfig);
// map<string|string[]> headers = {
//     "Access-Control-Allow-Headers": "authorization,Access-Control-Allow-Origin,Content-Type,SOAPAction,Authorization,jwt,API-Key",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS"
// };
// service /monitoring on new http:Listener(9090) {
//     resource function post addRepos/[string orgName]/[string orgId]() returns string|error {
//         createDBnContainersIfNotExist(orgId);
//         log:printInfo("Getting all repos...");
//         stream<github:Repository, error?> getRepositoriesResponse = check githubEndpoint->repos/;
//         error? e = getRepositoriesResponse.forEach(function(github:Repository repository) {
//             string repoId = repository["id"].toString();
//             string repoName = repository["name"].toString();
//             map<json> RepoBasicDetailsDocument = createDocumentFromRepoBasicDetails(repository, orgId, 0, 0, DEFAULT_TAG);
//             cosmosdb:DocumentResponse|error docResponseStoreBasicDetails = azureCosmosClient->createDocument(databaseId, basicRepoDetailsContainerId,
//         repoId, RepoBasicDetailsDocument, orgId);
//             if docResponseStoreBasicDetails is cosmosdb:DocumentResponse {
//                 github:Repository|github:Error repoWithAdditionalInfo = githubEndpoint->getRepository(orgName, repoName);
//                 if repoWithAdditionalInfo is github:Repository {
//                     map<json> RepositoryInfoDocument = createDocumentFromRepository(repoWithAdditionalInfo, orgName, orgId, 0);
//                     cosmosdb:DocumentResponse|error result = azureCosmosClient->createDocument(databaseId, repoContainerId,
//         repoId, RepositoryInfoDocument, orgId);
//                     addLanguagesToDbUsingRepoLanguages(RepositoryInfoDocument.get("languages"), databaseId, languagesContainerId, orgId);
//                 }
//             }
//         });
//         if (e is error) {
//             log:printInfo("Please RETRY again in few minitues...");
//             return ("Please RETRY again in few minitues...");
//         } else {
//             log:printInfo("Successfully imported all repos!");
//             return ("Successfully imported all repos!");
//         }
//     }
//     resource function post addRepoByName/[string orgId]/[string orgName]/[string repoName]() returns string|error {
//         log:printInfo("Getting a specific repo...");
//         github:Repository correspondingRepoInGithub = check githubEndpoint->getRepository(orgName, repoName);
//         string repoId = correspondingRepoInGithub["id"].toString();
//         map<json> RepoBasicDetailsDocument = createDocumentFromRepoBasicDetails(correspondingRepoInGithub, orgId, 0, 0, DEFAULT_TAG);
//         cosmosdb:DocumentResponse _ = check azureCosmosClient->createDocument(databaseId, basicRepoDetailsContainerId,
//         repoId, RepoBasicDetailsDocument, orgId);
//         map<json> newDocumentBody = createDocumentFromRepository(correspondingRepoInGithub, orgName, orgId, 0);
//         cosmosdb:DocumentResponse _ = check azureCosmosClient->createDocument(databaseId, repoContainerId,
//         repoId, newDocumentBody, orgId);
//         // add new languages if available
//         addLanguagesToDbUsingRepoLanguages(newDocumentBody.get("languages"), databaseId, languagesContainerId, orgId);
//         log:printInfo("Repo add process finished getting latest repo details!");
//         return ("Repo add process finished getting latest repo details!");
//     }
//     // update db for selected repo with latest available changes in Github
//     resource function post mergeLatestRepositoryInfoToDB/[string orgName](@http:Payload RepoUpdateInfo repoInfo) returns string|error {
//         log:printInfo("Getting latest changes...");
//         string repoId = repoInfo.id;
//         string repoName = repoInfo.repoName;
//         string orgId = repoInfo.orgId;
//         int monitorStatus = repoInfo.monitorStatus;
//         github:Repository correspondingRepoInGithub = check githubEndpoint->getRepository(orgName, repoName);
//         map<json> newDocumentBody = createDocumentFromRepository(correspondingRepoInGithub, orgName, orgId, monitorStatus);
//         cosmosdb:DocumentResponse result = check azureCosmosClient->replaceDocument(databaseId, repoContainerId,
//         repoId, newDocumentBody, orgId);
//         // add new languages if available
//         addLanguagesToDbUsingRepoLanguages(newDocumentBody.get("languages"), databaseId, languagesContainerId, orgId);
//         log:printInfo("Update process finished getting latest details!");
//         return ("Update process finished getting latest details!");
//     }
//     // If multiple languages are missing in container, run this
//     // This will iterrate through all the added repos and extract the languages to add in db
//     resource function post addLanguages/[string orgName]/[string orgId]() returns string|error {
//         createContainer(databaseId, languagesContainerId, "/orgId"); //create a new container for languages
//         stream<github:Repository, error?> getRepositoriesResponse = check githubEndpoint->getRepositories(orgName, true);
//         error? e = getRepositoriesResponse.forEach(function(github:Repository repository) {
//             string repoName = repository["name"].toString();
//             github:Repository|github:Error repoForLanguages = githubEndpoint->getRepository(orgName, repoName);
//             if repoForLanguages is github:Repository {
//                 addLanguagesToDbUsingRepo(repoForLanguages, databaseId, languagesContainerId, orgId);
//             }
//         });
//         if (e is error) {
//             log:printInfo("Not successfull in importing languages ...");
//         } else {
//             log:printInfo("Successfully imported all languages!");
//         }
//         return "done....";
//     }
//     resource function get getLanguages/[string orgId]() returns http:Ok|error {
//         log:printInfo("Getting list of languages");
//         stream<record {}, error?> result = check azureCosmosClient->getDocumentList(databaseId, languagesContainerId,
//     orgId);
//         // if (result is stream<cosmosdb:Document, error?>) {
//         json[] languageList = [];
//         check result.forEach(function(record {} language) {
//             log:printInfo(language.toString());
//             json languageBasicInfo = {
//                 id: language["id"].toString(),
//                 name: language["name"].toString(),
//                 testingTools: language["testingTools"].toJson()
//             };
//             log:printInfo(languageBasicInfo.toJsonString());
//             languageList.push(languageBasicInfo);
//         });
//         log:printInfo("Success!");
//         http:Ok response = {
//             body: languageList,
//             headers: headers
//         };
//         return response;
//     }
//     resource function get getLanguageById/[string orgId]/[string languageId]() returns http:Ok|error {
//         log:printInfo("Read a lang by id");
//         record {} result = check azureCosmosClient->getDocument(databaseId, languagesContainerId, languageId,
//         orgId);
//         log:printInfo(result.toString());
//         http:Ok response = {
//             body: result.toJson(),
//             headers: headers
//         };
//         return response;
//     }
//     resource function post addTestingTool/[string newToolName](@http:Payload LanguageInfo languageInfo) returns http:Ok|http:BadRequest|error {
//         json[] testingTools = languageInfo.testingTools;
//         string uuidForNewTool = uuid:createType1AsString();
//         boolean isToolAlredyNotExist = true;
//         foreach var testingTool in testingTools {
//             json|error toolName = testingTool.toolName;
//             if toolName is json && toolName.toString() == newToolName {
//                 isToolAlredyNotExist = false;
//             }
//         }
//         if isToolAlredyNotExist {
//             json newToolInfo = {
//             id: uuidForNewTool,
//             toolName: newToolName
//         };
//             testingTools.push(newToolInfo);
//             string languageId = languageInfo.id.toString();
//             map<json> documentBody = {
//             name: languageInfo.name,
//             orgId: languageInfo.orgId,
//             testingTools: testingTools
//         };
//             log:printInfo(documentBody.toString());
//             cosmosdb:DocumentResponse result = check azureCosmosClient->replaceDocument(databaseId, languagesContainerId,
//     languageId, documentBody, languageInfo.orgId);
//             http:Ok response = {
//             body: {
//                 "success": true,
//                 "data": result.toString()
//             },
//             headers: headers
//         };
//             return response;
//         }
//         else {
//             http:BadRequest response = {
//             body: {
//                 "success": false
//             },
//             headers: headers
//         };
//             return response;
//         }
//     }
//     resource function post deleteTestingTool/[string deletingTestingTool](@http:Payload LanguageInfo languageInfo) returns http:Ok|http:BadRequest|error {
//         json[] testingTools = languageInfo.testingTools;
//         json[] testingToolsWithUpdates = [];
//         boolean isToolAlredyExist = false;
//         log:printInfo("service executed");
//         foreach var testingTool in testingTools {
//             json|error toolName = testingTool.toolName;
//             if toolName is json && toolName.toString() != deletingTestingTool {
//                 testingToolsWithUpdates.push(testingTool);
//             }
//             else {
//                 isToolAlredyExist = true;
//             }
//         }
//         if isToolAlredyExist {
//             string languageId = languageInfo.id.toString();
//             map<json> documentBody = {
//             name: languageInfo.name,
//             orgId: languageInfo.orgId,
//             testingTools: testingToolsWithUpdates
//         };
//             log:printInfo(documentBody.toString());
//             cosmosdb:DocumentResponse result = check azureCosmosClient->replaceDocument(databaseId, languagesContainerId,
//     languageId, documentBody, languageInfo.orgId);
//             http:Ok response = {
//             body: {
//                 "success": true,
//                 "data": result.toString()
//             },
//             headers: headers
//         };
//             return response;
//         }
//                 else {
//             http:BadRequest response = {
//             body: {
//                 "success": false
//             },
//             headers: headers
//         };
//             return response;
//         }
//     }
//     resource function get getAllRepos/[string orgId]/[string tagName]() returns http:Ok|error {
//         json[] repoInfoList = check quaryDBUsingTag(databaseId, basicRepoDetailsContainerId, orgId, tagName);
//         http:Ok response = {
//             body: repoInfoList,
//             headers: headers
//         };
//         return response;
//     }
//     resource function get getWatchingRepos/[string orgId]/[string tagName]() returns http:Ok|error {
//         log:printInfo("Query1 - Select all from the repos where status is 1");
//         json[] repoInfoList = check quaryDB(databaseId, basicRepoDetailsContainerId, orgId, 1, tagName);
//         http:Ok response = {
//             body: repoInfoList,
//             headers: headers
//         };
//         return response;
//     }
//     resource function get getNonWatchingRepos/[string orgId]/[string tagName]() returns http:Ok|error {
//         log:printInfo("Query1 - Select all from the repos where status is 0");
//         json[] repoInfoList = check quaryDB(databaseId, basicRepoDetailsContainerId, orgId, 0, tagName);
//         http:Ok response = {
//             body: repoInfoList,
//             headers: headers
//         };
//         return response;
//     }
//     resource function get getCompleteRepoDetailsById/[string orgId]/[string repoId]() returns http:Ok|error {
//         log:printInfo("getCompleteRepoDetailsById");
//         record {} result = check azureCosmosClient->getDocument(databaseId, repoContainerId, repoId,
//         orgId);
//         log:printInfo(result.toString());
//         http:Ok response = {
//             body: result.toJson(),
//             headers: headers
//         };
//         return response;
//     }
//     resource function put changeRepoBasicInfo(@http:Payload RepoBasicDetails repoDetails) returns http:Ok|error {
//         log:printInfo("Changing Repo Basic Info...");
//         map<json> documentBody = {
//             createdAt: repoDetails.createdAt,
//             monitorStatus: repoDetails.monitorStatus,
//             orgId: repoDetails.orgId,
//             repoName: repoDetails.repoName,
//             tag: repoDetails.tag,
//             repoWatchStatus: repoDetails.repoWatchStatus
//         };
//         cosmosdb:DocumentResponse result = check azureCosmosClient->replaceDocument(databaseId, basicRepoDetailsContainerId,
//     repoDetails.id, documentBody, repoDetails.orgId);
//         http:Ok response = {
//             body: {
//                 "success": true,
//                 "data": result.toString()
//             },
//             headers: headers
//         };
//         return response;
//     }
//     resource function put changeMonitorStatus(@http:Payload RepoBasicDetails repoDetails) returns http:Ok|error {
//         map<json> documentBody = {
//             createdAt: repoDetails.createdAt,
//             monitorStatus: repoDetails.monitorStatus,
//             orgId: repoDetails.orgId,
//             repoName: repoDetails.repoName,
//             tag: repoDetails.tag,
//             repoWatchStatus: repoDetails.repoWatchStatus
//         };
//         cosmosdb:DocumentResponse result = check azureCosmosClient->replaceDocument(databaseId, basicRepoDetailsContainerId,
//     repoDetails.id, documentBody, repoDetails.orgId);
//         http:Ok response = {
//             body: {
//                 "success": true,
//                 "data": result.toString()
//             },
//             headers: headers
//         };
//         return response;
//     }
//     resource function put modifyRepositoryInfo(@http:Payload RepositoryInfo repoInfo) returns http:Ok|error {
//         log:printInfo("Updating Repo Details...");
//         map<json> documentBody = {
//             description: repoInfo.description,
//             dbUpdatedAt: repoInfo.dbUpdatedAt,
//             languages: repoInfo.languages,
//             monitorStatus: repoInfo.monitorStatus,
//             orgId: repoInfo.orgId,
//             openPRs: repoInfo.openPRs,
//             repoUrl: repoInfo.repoUrl,
//             repoName: repoInfo.repoName,
//             updatedAt: repoInfo.updatedAt
//         };
//         cosmosdb:DocumentResponse result = check azureCosmosClient->replaceDocument(databaseId, repoContainerId,
//     repoInfo.id, documentBody, repoInfo.orgId);
//         http:Ok response = {
//             body: {
//                 "success": true,
//                 "data": result.toString()
//             },
//             headers: headers
//         };
//         return response;
//     }
//     resource function post addTag/[string orgId]/[string tagName]() returns http:Ok|error {
//         map<json> newDocumentBody = {
//                                 tag: tagName,
//                                 orgId: orgId
//                             };
//         cosmosdb:DocumentResponse|error result = azureCosmosClient->createDocument(databaseId, tagContainerId,
//     tagName, newDocumentBody, orgId);
//         if result is cosmosdb:DocumentResponse {
//             http:Ok response = {
//                 body: "success",
//                 headers: headers
//                 };
//             return response;
//         } else {
//             // try creating tag container and re executing the code
//             log:printInfo("try creating tag container and re executing the code!");
//             createTagContainernAddDefaultTag(orgId);
//             cosmosdb:DocumentResponse|error retryResult = azureCosmosClient->createDocument(databaseId, tagContainerId,
//     tagName, newDocumentBody, orgId);
//             if retryResult is cosmosdb:DocumentResponse {
//                 http:Ok response = {
//                 body: "success",
//                 headers: headers
//                 };
//                 return response;
//             } else {
//                 return retryResult;
//             }
//         }
//     }
//     resource function delete deleteTag/[string orgId]/[string tagName]() returns http:Ok|http:InternalServerError|error {
//         if isQuaryDBTagsDeleted(databaseId, basicRepoDetailsContainerId, orgId, tagName) == true {
//             cosmosdb:DocumentResponse documentResponse = check azureCosmosClient->deleteDocument(databaseId, tagContainerId,
//     tagName, orgId);
//             if documentResponse is cosmosdb:DocumentResponse {
//                 http:Ok response = {
//                 body: "delete success",
//                 headers: headers
//                 };
//                 return response;
//             }
//         } else {
//             http:InternalServerError response = {
//                 body: "error occured",
//                 headers: headers
//                 };
//             return response;
//         }
//     }
//     resource function get getTagsList/[string orgId]() returns http:Ok|error {
//         stream<record {}, error?> result = check azureCosmosClient->getDocumentList(databaseId, tagContainerId,
//     orgId);
//         json[] tagList = [];
//         check result.forEach(function(record {} tag) {
//             json tagBasicInfo = {
//                 id: tag["id"].toString(),
//                 name: tag["tag"].toString()
//             };
//             log:printInfo(tagBasicInfo.toJsonString());
//             tagList.push(tagBasicInfo);
//         });
//         log:printInfo("Success!");
//         http:Ok response = {
//             body: tagList,
//             headers: headers
//         };
//         return response;
//     }
// }
// public function deleteContainer() {
//     log:printInfo("Deleting the container");
//     cosmosdb:DeleteResponse|error result = managementClient->deleteContainer(databaseId, repoContainerId);
//     if (result is cosmosdb:DeleteResponse) {
//         log:printInfo(result.toString());
//         log:printInfo("Deleting Success!");
//     } else {
//         log:printError(result.message());
//     }
// }
// public function createDBnContainersIfNotExist(string orgId) {
//     log:printInfo("Creating database only if it does not exist");
//     cosmosdb:Database?|error databaseIfNotExist = managementClient->createDatabaseIfNotExist(databaseId);
//     if (databaseIfNotExist is cosmosdb:Database?) {
//         createContainer(databaseId, repoContainerId, "/orgId"); //create a new container for repos
//         createContainer(databaseId, languagesContainerId, "/orgId"); //create a new container for languages
//         createContainer(databaseId, basicRepoDetailsContainerId, "/orgId"); //create a new container for basic Repo Details
//         createTagContainernAddDefaultTag(orgId);
//     } else {
//         log:printError(databaseIfNotExist.message());
//     }
// }
// public function createTagContainernAddDefaultTag(string orgId) {
//     createContainer(databaseId, tagContainerId, "/orgId");
//     map<json> newDocumentBody = {
//                                 tag: DEFAULT_TAG,
//                                 orgId: orgId
//                             };
//     cosmosdb:DocumentResponse|error result = azureCosmosClient->createDocument(databaseId, tagContainerId,
//     DEFAULT_TAG, newDocumentBody, orgId);
// }
// public function createContainer(string databaseId, string containerId, string partitionKeyPath) {
//     log:printInfo("Creating container");
//     cosmosdb:PartitionKey newPartitionKey = {
//         paths: [partitionKeyPath],
//         keyVersion: 2
//     };
//     cosmosdb:Container|error result = managementClient->createContainer(databaseId, containerId, newPartitionKey);
//     if (result is cosmosdb:Container) {
//         log:printInfo("Creating Container Success!");
//     } else {
//         log:printError(result.message());
//     }
// }
// //add language info to db using a language json
// public function addLanguagesToDbUsingRepoLanguages(json repoLanguages, string databaseId, string languagesContainerId, string orgId) {
//     json[] languages = <json[]>repoLanguages;
//     log:printInfo(languages.toString());
//     foreach var lang in languages {
//         json|error id = lang.id;
//         json|error name = lang.name;
//         json[] testingTools = [];
//         if id is json && name is json {
//             map<json> newDocumentBody = {
//                                 name: name,
//                                 orgId: orgId,
//                                 testingTools: testingTools
//                             };
//             cosmosdb:DocumentResponse|error result = azureCosmosClient->createDocument(databaseId, languagesContainerId,
//     id.toString(), newDocumentBody, orgId);
//             if result is cosmosdb:DocumentResponse {
//                 log:printInfo("Added a new language!");
//             } else {
//                 log:printInfo("No new language added...");
//             }
//         }
//     }
// }
// //add language info to db using a github repo
// public function addLanguagesToDbUsingRepo(github:Repository repoForLanguages, string databaseId, string languagesContainerId, string orgId) {
//     github:Language[]? languages = repoForLanguages.languages;
//     log:printInfo(languages.toString());
//     if languages is github:Language[] {
//         foreach var lang in languages {
//             string? id = lang.id;
//             json[] testingTools = [];
//             if id is string {
//                 map<json> newDocumentBody = {
//                                 name: lang.name,
//                                 orgId: orgId,
//                                 testingTools: testingTools
//                             };
//                 cosmosdb:DocumentResponse|error result = azureCosmosClient->createDocument(databaseId, languagesContainerId,
//     id, newDocumentBody, orgId);
//                 if result is cosmosdb:DocumentResponse {
//                     log:printInfo("Added a new language!");
//                 } else {
//                     log:printInfo("No new language added...");
//                 }
//             }
//         }
//     }
// }
// public function getWatchingReposWithId(string databaseId, string repoContainerId, string partitionKeyValue, int repoState) returns string[]|error {
//     string selectAllQuery = string `SELECT * FROM ${repoContainerId.toString()} f WHERE f.repoWatchStatus = ${repoState}`;
//     cosmosdb:QueryOptions options = {partitionKey: partitionKeyValue};
//     stream<record {}, error?> result = check azureCosmosClient->queryDocuments(databaseId, repoContainerId,
//         selectAllQuery, options);
//     string[] repoIdList = [];
//     check result.forEach(function(record {} queryResult) {
//         log:printInfo(queryResult["id"].toString());
//         repoIdList.push(queryResult["id"].toString());
//     });
//     return repoIdList;
// }
// public function isQuaryDBTagsDeleted(string databaseId, string basicRepoDetailsContainerId, string partitionKeyValue, string tagName) returns boolean|error? {
//     string selectAllQuery = string `SELECT * FROM ${basicRepoDetailsContainerId} f WHERE f.tag = "${tagName}"`;
//     cosmosdb:QueryOptions options = {partitionKey: partitionKeyValue};
//     stream<record {}, error?> result = check azureCosmosClient->queryDocuments(databaseId, basicRepoDetailsContainerId,
//         selectAllQuery, options);
//     boolean deletedTagsWithoutIssue = true;
//     check result.forEach(function(record {} repo) {
//         int repoMonitorStatus = repo["monitorStatus"].toString() == "1" ? 1 : 0;
//         int repoWatchStatus = repo["repoWatchStatus"].toString() == "1" ? 1 : 0;
//         map<json> documentBody = {
//                 createdAt: repo["createdAt"].toString(),
//                 monitorStatus: repoMonitorStatus,
//                 orgId: partitionKeyValue,
//                 repoWatchStatus: repoWatchStatus,
//                 repoName: repo["repoName"].toString(),
//                 tag: DEFAULT_TAG
//             };
//         cosmosdb:DocumentResponse|error documentResponse = azureCosmosClient->replaceDocument(databaseId, basicRepoDetailsContainerId,
//     repo["id"].toString(), documentBody, partitionKeyValue);
//         io:println("Viraj:error ", documentResponse);
//         if documentResponse is error {
//             deletedTagsWithoutIssue = false;
//         }
//     });
//     return deletedTagsWithoutIssue;
// }
// public function quaryDBUsingTag(string databaseId, string basicRepoDetailsContainerId, string partitionKeyValue, string tagName) returns json[]|error {
//     json[] repoInfoList = [];
//     string selectAllQuery = string `SELECT * FROM ${basicRepoDetailsContainerId} f WHERE f.tag = "${tagName}"`;
//     cosmosdb:QueryOptions options = {partitionKey: partitionKeyValue};
//     log:printInfo("Getting list of tagged repos");
//     stream<record {}, error?> result = check azureCosmosClient->queryDocuments(databaseId, basicRepoDetailsContainerId,
//         selectAllQuery, options);
//     check result.forEach(function(record {} repo) {
//         json repoBasicInfo = {
//                 id: repo["id"].toString(),
//                 createdAt: repo["createdAt"].toString(),
//                 monitorStatus: repo["monitorStatus"].toString(),
//                 repoWatchStatus: repo["repoWatchStatus"].toString(),
//                 repoName: repo["repoName"].toString(),
//                 tag: repo["tag"].toString()
//             };
//         log:printInfo(repoBasicInfo.toJsonString());
//         repoInfoList.push(repoBasicInfo);
//     });
//     return repoInfoList;
// }
// public function quaryDB(string databaseId, string basicRepoDetailsContainerId, string partitionKeyValue, int repoState, string tagName) returns json[]|error {
//     string selectAllQuery = string `SELECT * FROM ${basicRepoDetailsContainerId} f WHERE f.repoWatchStatus = ${repoState} AND f.tag = "${tagName}"`;
//     cosmosdb:QueryOptions options = {partitionKey: partitionKeyValue};
//     stream<record {}, error?> result = check azureCosmosClient->queryDocuments(databaseId, basicRepoDetailsContainerId,
//         selectAllQuery, options);
//     json[] repoInfoList = [];
//     check result.forEach(function(record {} queryResult) {
//         json repoBasicInfo = {
//                 id: queryResult["id"].toString(),
//                 createdAt: queryResult["createdAt"].toString(),
//                 repoWatchStatus: queryResult["repoWatchStatus"].toString(),  // TODO: try returning int
//                 monitorStatus: queryResult["monitorStatus"].toString(),  // TODO: try returning int
//                 repoName: queryResult["repoName"].toString(),
//                 tag: queryResult["tag"].toString()
//         };
//         log:printInfo(repoBasicInfo.toJsonString());
//         repoInfoList.push(repoBasicInfo);
//     });
//     return repoInfoList;
// }
// //TODO: add feature to preserve monitor state and already open Prs
// public function createDocumentFromRepository(github:Repository repository, string orgName, string orgId, int monitorStatus) returns map<json> {
//     string repoName = repository["name"].toString();
//     json languages = repository["languages"].toJson();
//     json[] openPRs = [];
//     stream<github:PullRequest, github:Error?>|error streamResult = githubEndpoint->getPullRequests(orgName, repoName, "OPEN");
//     if streamResult is stream<github:PullRequest, github:Error?> {
//         github:Error? err = streamResult.forEach(function(github:PullRequest pullRequest) {
//             int prnum = pullRequest.number;
//             github:PullRequest|github:Error pr = githubEndpoint->getPullRequest(orgName, repoName, prnum);
//             if pr is github:PullRequest {
//                 OpenPR openPR = {
//                     prNumber: prnum,
//                     prUrl: pr.url.toString(),
//                     lastCommit: pr.lastCommit.toJson()
//                 };
//                 openPRs.push(openPR.toJson());
//             }
//         });
//     }
//     map<json> newDocumentBody = {
//                     description: repository["description"].toString(),
//                     dbUpdatedAt: time:utcToString(time:utcNow()),
//                     languages: languages,
//                     monitorStatus: monitorStatus,
//                     openPRs: openPRs,
//                     orgId: orgId,
//                     repoName: repository["name"].toString(),
//                     repoUrl: repository["url"].toString(),
//                     updatedAt: repository["updatedAt"].toString()
//                 };
//     return newDocumentBody;
// }
// public function createDocumentFromRepoBasicDetails(github:Repository repository, string orgId, int repoWatchStatus, int monitorStatus, string tag) returns map<json> {
//     map<json> newDocumentBody = {
//                     createdAt: repository["createdAt"].toString(),
//                     monitorStatus: monitorStatus,
//                     orgId: orgId,
//                     repoName: repository["name"].toString(),
//                     repoWatchStatus: repoWatchStatus,
//                     tag: tag
//                 };
//     return newDocumentBody;
// }
// public type RepositoryInfo record {
//     string id;
//     string description;
//     string dbUpdatedAt;
//     json[] languages;
//     json[] openPRs;
//     string orgId;
//     string repoUrl;
//     string repoName;
//     int monitorStatus;
//     string updatedAt;
// };
// public type RepoBasicDetails record {
//     string id;
//     string createdAt;
//     int monitorStatus;
//     string orgId;
//     string repoName;
//     int repoWatchStatus;
//     string tag;
// };
// public type RepoUpdateInfo record {
//     string id;
//     string repoName;
//     string orgId;
//     int monitorStatus;
// };
// public type Language record {|
//     string name;
//     string id;
// |};
// public type LanguageInfo record {
//     string id;
//     string name;
//     json[] testingTools;
//     string orgId;
// };
// public type OpenPR record {
//     int prNumber;
//     string prUrl;
//     json lastCommit;
// };