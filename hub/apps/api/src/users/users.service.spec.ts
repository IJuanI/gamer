import { UsersService } from "./users.service";
import { FirestoreService } from "../firestore/firestore.service";

describe("UsersService", () => {
  let service: UsersService;
  let firestore: FirestoreService;

  beforeEach(() => {
    firestore = new FirestoreService();
    service = new UsersService(firestore);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
