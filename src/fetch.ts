import { fetchNoCors } from "@decky/api";
import { isNil } from "./utils/isNil";

const API_URL =
  "https://eu-central-1.aws.data.mongodb-api.com/app/data-vzkgtfx/endpoint/data/v1/action/aggregate";

const FETCH_HEADERS = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    apiKey: "8lTTig5uhPYa5tpl1Buusi9ADSq2i37Xd4xNdt5C2t9cPPyV5a4DQWKsqqSaNVSs",
  },
};

const FETCH_BODY = {
  collection: "games",
  database: "games_info",
  dataSource: "Cluster0",
};

export async function fetchGamesWithSameName(
  displayName: string,
  platform: Platforms,
) {
  const response = await fetchNoCors(API_URL, {
    method: "POST",
    ...FETCH_HEADERS,
    body: JSON.stringify({
      ...FETCH_BODY,
      pipeline: [
        {
          $search: {
            text: {
              path: "titles",
              query: displayName,
            },
          },
        },
        {
          $match: {
            platform,
          },
        },
        {
          $limit: 5,
        },
      ],
    }),
  });

  if (isNil(response)) {
    // eslint-disable-next-line
    throw new Error('Null response from "DataBase" API');
  }

  if (!response.ok) {
    throw new Error(
      `[MetadataData][fetchMetadata] Error response on fetching information about: "${displayName}"`,
    );
  }

  const result = await response.json();

  return result.documents;
}

/**
 * Is used to connect to the MongodDB API service.
 * Any positive response will indicate what plugin can initialize and fetch metdata for emulated games.
 */
export async function tryConnectToServices() {
  return await fetchNoCors(API_URL, {
    method: "POST",
    ...FETCH_HEADERS,
    body: JSON.stringify({
      ...FETCH_BODY,
      pipeline: [
        {
          $limit: 1,
        },
      ],
    }),
  });
}
