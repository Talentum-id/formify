import Text "mo:base/Text";
import RBTree "mo:base/RBTree";
import Map "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Error "mo:base/Error";
import Utils "utils";

actor UserIndex {
  type UserData = {
    username : Text;
    fullName : Text;
  };

  stable var userEntries : [(Text, UserData)] = [];
  stable var usernameEntries : [(Text, Text)] = [];

  let users = Map.fromIter<Text, UserData>(userEntries.vals(), 1000, Text.equal, Text.hash);
  let usernames = Map.fromIter<Text, Text>(usernameEntries.vals(), 1000, Text.equal, Text.hash);

  public shared ({ caller }) func register(data : UserData, character : Utils.Character) : async ?UserData {
    let { username; fullName } = data;
    let identity = await Utils.authenticate(caller, true, character);

    if (username.size() == 0 or fullName.size() == 0) {
      throw Error.reject("Username and Full name cannot be empty");
    };

    if (username.size() < 4 or username.size() > 18) {
      throw Error.reject("Username should have from 4 to 18 characters.");
    };

    if (await findUsername(username)) {
      throw Error.reject("This username already exists");
    } else {
      switch (users.get(identity)) {
        case null {
          users.put(
            identity,
            {
              username;
              fullName;
            },
          );
          usernames.put(username, identity);
        };
        case (?user) {};
      };
    };

    users.get(identity);
  };

  public query func findUser(identity : Text) : async ?UserData {
    users.get(identity);
  };

  public query func findUsername(username : Text) : async Bool {
    usernames.get(username) != null;
  };

  public query func readAll() : async Text {
    var pairs = "";

    for ((key, value) in users.entries()) {
      pairs := "(" # key # ", " # value.username # " " # value.fullName # ") " # pairs;
    };

    for ((key, value) in usernames.entries()) {
      pairs := "(" # key # ", " # value # ") " # pairs;
    };

    return pairs;
  };

  public func reset() : async () {
    for ((key, value) in users.entries()) {
      users.delete(key);
    };

    for ((key, value) in usernames.entries()) {
      usernames.delete(key);
    };

  };

  system func preupgrade() {
    userEntries := Iter.toArray(users.entries());
    usernameEntries := Iter.toArray(usernames.entries());
  };

  system func postupgrade() {
    userEntries := [];
    usernameEntries := [];
  };
};
