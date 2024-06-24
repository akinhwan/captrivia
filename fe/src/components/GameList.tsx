// const GameList: React.FC = (
//   isLoading,
//   error,
//   games,
//   isConnected,
//   handleJoinGame,
//   handleReadyGame,
//   handleStartGame,
//   joinedGames,
//   readyGames,
//   createdGames
// ) => {
//   return (
//     <>
//       <h3 className="text-xl mt-4 mb-4">Game List</h3>

//       {isLoading ? (
//         <p>Loading games...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : games.length === 0 ? (
//         <p>No games available.</p>
//       ) : (
//         <ul className="space-y-2">
//           {games.map((game) => (
//             <li key={game.id} className="bg-gray-100 p-4 rounded">
//               <h2 className="text-xl font-semibold">{game.name}</h2>
//               <p>Question Count: {game.question_count}</p>
//               <p>State: {game.state}</p>
//               {/* <p>Players: {game.player_count}</p> */}
//               {isConnected && (
//                 <div>
//                   <button
//                     onClick={() => handleJoinGame(game.id)}
//                     className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 ${
//                       joinedGames.has(game.id)
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     disabled={
//                       joinedGames.has(game.id) ||
//                       !createdGames.has(game.id) ||
//                       game.state === "waiting"
//                     }
//                   >
//                     Join Game
//                   </button>

//                   {joinedGames.has(game.id) && (
//                     <button
//                       onClick={() => handleReadyGame(game.id)}
//                       className={`bg-yellow-500 text-white px-4 py-2 rounded mt-2 ml-2 ${
//                         readyGames.has(game.id)
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                       disabled={readyGames.has(game.id)}
//                     >
//                       Ready
//                     </button>
//                   )}
//                   {joinedGames.has(game.id) &&
//                     createdGames.has(game.id) &&
//                     game.state === "waiting" && (
//                       <button
//                         onClick={() => handleStartGame(game.id)}
//                         className="bg-green-500 text-white px-4 py-2 rounded mt-2 ml-2"
//                       >
//                         Start Game
//                       </button>
//                     )}
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </>
//   );
// };

// export default GameList;
