import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Map "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Types "/types";

actor StatsIndex {
  type GeneralStatsData = Types.GeneralData;
  type List = Types.ListResult;
  type Params = Types.FetchParams;
  type StatsData = Types.Data;

  stable var statsEntries : [(Text, StatsData)] = [];
  stable var generalStats : [GeneralStatsData] = [];

  let stats = Map.fromIter<Text, StatsData>(statsEntries.vals(), 1000, Text.equal, Text.hash);

  public query func list(params : Params) : async List {
    var data = generalStats;
    let { page; pageSize } = params;

    if (data.size() < 1) {
      return {
        pagination = {
          total = 0;
          count = 0;
          per_page = 10;
          current_page = 1;
          total_pages = 1;
        };
        data = [];
      };
    };

    data := Array.sort<GeneralStatsData>(
      data,
      func(x : GeneralStatsData, y : GeneralStatsData) {
        let (key1 : Text, key2 : Text) = (Nat.toText(x.points), Nat.toText(y.points));

        if (key1 > key2) #less else if (key2 < key1) #greater else #equal;
      },
    );

    let pagination = {
      total = data.size();
      count = params.pageSize;
      per_page = params.pageSize;
      current_page = params.page;
      total_pages = Float.ceil(Float.fromInt(data.size()) / Float.fromInt(params.pageSize));
    };

    if (page != 0 and pageSize != 0) {
      var offset : Int = page - 1;
      offset := offset * pageSize;

      var limit : Int = if (data.size() < offset + pageSize) data.size() else offset + pageSize;
      var slicedData = Array.slice<GeneralStatsData>(data, Int.abs(offset), Int.abs(limit));

      data := Iter.toArray(slicedData);
    };

    { data; pagination };
  };

  public func incrementFormCreated(identity : Text) {
    switch (stats.get(identity)) {
      case null {
        stats.put(
          identity,
          {
            forms_created = 1;
            forms_completed = 0;
            points = 5;
          },
        );

        let statistics = Buffer.fromArray<GeneralStatsData>(generalStats);

        statistics.add({
          forms_created = 1;
          forms_completed = 0;
          points = 5;
          identity;
        });

        generalStats := Buffer.toArray(statistics);
      };
      case (?stat) {
        stats.put(
          identity,
          {
            forms_created = stat.forms_created + 1;
            forms_completed = stat.forms_completed;
            points = stat.points + 5;
          },
        );

        let newStats = Array.map<GeneralStatsData, GeneralStatsData>(
          generalStats,
          func value = {
            forms_created = stat.forms_created + 1;
            forms_completed = stat.forms_completed;
            points = stat.points + 5;
            identity;
          },
        );

        generalStats := newStats;
      };
    };
  };

  public func incrementFormCompleted(identity : Text, points : Nat) {
    switch (stats.get(identity)) {
      case null {
        stats.put(
          identity,
          {
            forms_created = 0;
            forms_completed = 1;
            points;
          },
        );

        let statistics = Buffer.fromArray<GeneralStatsData>(generalStats);

        statistics.add({
          forms_created = 0;
          forms_completed = 1;
          points;
          identity;
        });

        generalStats := Buffer.toArray(statistics);
      };
      case (?stat) {
        stats.put(
          identity,
          {
            forms_created = stat.forms_created;
            forms_completed = stat.forms_completed;
            points = points + stat.points;
          },
        );

        let newStats = Array.map<GeneralStatsData, GeneralStatsData>(
          generalStats,
          func value = {
            forms_created = stat.forms_created;
            forms_completed = stat.forms_completed + 1;
            points = stat.points + points;
            identity;
          },
        );

        generalStats := newStats;
      };
    };
  };

  public query func findStats(identity : Text) : async ?StatsData {
    switch (stats.get(identity)) {
      case null null;
      case (?stats) ?stats;
    };
  };

  system func preupgrade() {
    statsEntries := Iter.toArray(stats.entries());
  };

  system func postupgrade() {
    statsEntries := [];
  };
};
