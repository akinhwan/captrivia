import React from "react";
import { Link } from "react-router-dom";

const Leaderboard: React.FC = ({ leaderboard }) => {
  return (
    <div className="container mx-auto mt-10">
      <Link className="text-blue-500 hover:text-blue-700" to="/">
        ← Return to Home
      </Link>

      <h3 className="text-xl mt-4 mb-4">Leaderboard</h3>
      {leaderboard && leaderboard.length != 0 ? (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 text-left">Player Name</th>
              <th className="py-2 text-left">Accuracy</th>
              <th className="py-2 text-left">Avg. Time (ms)</th>
              <th className="py-2 text-left">Correct Questions</th>
              <th className="py-2 text-left">Total Time (ms)</th>
              <th className="py-2 text-left">Total Questions</th>
              <th className="py-2 text-left">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 &&
              leaderboard.map((player) => (
                <tr key={player.player_name}>
                  <td className="border px-4 py-2">{player.player_name}</td>
                  <td className="border px-4 py-2">
                    {(player.accuracy * 100).toFixed(2)}%
                  </td>
                  <td className="border px-4 py-2">
                    {player.average_milliseconds}
                  </td>
                  <td className="border px-4 py-2">
                    {player.correct_questions}
                  </td>
                  <td className="border px-4 py-2">
                    {player.time_milliseconds}
                  </td>
                  <td className="border px-4 py-2">{player.total_questions}</td>
                  <td className="border px-4 py-2">
                    {new Date(player.last_update).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>No Leaderboard available.</p>
      )}
    </div>
  );
};

export default Leaderboard;
