import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

async function getPets(response: any): Promise<{ id: number; name: string }[]> {
  const responseBody = await response.json();
  return responseBody.map((pet: { id: number; name: string }) => ({
    id: pet.id,
    name: pet.name,
  }));
}

test("Create user ", async ({ request }) => {
  const timestamp = Date.now();
  console.log(`Generated ID: ${timestamp}`);

  const createUser = await request.post("https://petstore.swagger.io/v2/user", {
    data: {
      id: timestamp,
      username: `annaSQLI-${timestamp}`,
      firstName: "Anna",
      lastName: "SQLI",
      email: "anna@sqli.com",
      password: "admin123",
      phone: "123-456-7890",
      userStatus: 0,
    },
  });

  expect(createUser.ok()).toBeTruthy();

  const responseBody = await createUser.json();
  console.log("USER CREATED", responseBody);

  await new Promise((resolve) => setTimeout(resolve, 4000));

  const getUser = await request.get(
    `https://petstore.swagger.io/v2/user/annaSQLI-${timestamp}`
  );

  expect(getUser.ok()).toBeTruthy();

  const getUserResponseBody = await getUser.json();
  console.log("NEW USER", getUserResponseBody);
});

test("Sold pets", async ({ request }) => {
  const findByStatus = await request.get(
    "https://petstore.swagger.io/v2/pet/findByStatus?status=sold"
  );

  expect(findByStatus.ok()).toBeTruthy();

  const soldPets = await getPets(findByStatus);

  console.log("SOLD PETS", soldPets);

  const sharedDataPath = path.resolve(__dirname, "../utils/sharedData.json");
  fs.writeFileSync(
    sharedDataPath,
    JSON.stringify({ soldPets: soldPets }, null, 2)
  );
});

test("Shared name", async ({ request }) => {
  const sharedDataPath = path.resolve(__dirname, "../utils/sharedData.json");

  if (!fs.existsSync(sharedDataPath)) {
    console.log(
      "Shared data file not found. Please run the 'Sold pets' test first."
    );
    return;
  }

  const sharedData = JSON.parse(fs.readFileSync(sharedDataPath, "utf-8"));

  const soldPets = sharedData.soldPets;

  const analyzer = new PetNameAnalyzer(soldPets);
  const sharedNames = analyzer.findSharedNames();

  console.log("Shared Names", sharedNames);
});

class PetNameAnalyzer {
  private pets: { id: number; name: string }[];

  constructor(pets: { id: number; name: string }[]) {
    this.pets = pets;
  }

  findSharedNames(): { name: string; count: number }[] {
    const nameCount: { [key: string]: number } = {};

    this.pets.forEach((pet) => {
      if (pet.name) {
        nameCount[pet.name] = (nameCount[pet.name] || 0) + 1;
      }
    });

    return Object.entries(nameCount)
      .filter(([_, count]) => count > 1)
      .map(([name, count]) => ({ name, count }));
  }
}
