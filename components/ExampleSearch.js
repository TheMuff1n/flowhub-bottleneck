// Load the NoFlo interface
const noflo = require("noflo");
// Also load any other dependencies you have
// const http = require("http");

// Implement the getComponent function that NoFlo's component loader
// uses to instantiate components to the program
exports.getComponent = () => {
  // Start by instantiating a component
  const c = new noflo.Component();

  // Provide some metadata, including icon for visual editors
  c.description = "Searches GitHub for Repositories";
  c.icon = "search";

  // Declare the ports you want your component to have, including
  // their data types
  c.inPorts.add("search_term", {
    datatype: "string",
  });
  c.outPorts.add("repositories", {
    datatype: "object",
  });
  c.outPorts.add("error", {
    datatype: "object",
  });

  // Implement the processing function that gets called when the
  // inport buffers have packets available
  c.process((input, output) => {
    // Precondition: check that the "in" port has a data packet.
    // Not necessary for single-inport components but added here
    // for the sake of demonstration
    if (!input.hasData("search_term")) {
      return;
    }

    // Since the preconditions matched, we can read from the inport
    // buffer and start processing
    const searchTerm = input.getData("search_term");
    fetch(
      "https://api.github.com/search/repositories?q=" +
        encodeURIComponent(searchTerm) +
        "&page=0&per_page=10",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        // Send the file contents to the "out" port
        output.send({
          out: json,
        });
        // Tell NoFlo we've finished processing
        output.done();
      })
      .catch((err) => {
        // In case of errors we can just pass the error to the "error"
        // outport
        output.done(err);
      });
  });

  // Finally return to component to the loader
  return c;
};
