(function() {
    'use strict';

    if (!process.env.CF_USERNAME || !process.env.CF_KEY || !process.env.CF_REGION) {
        console.error('You must provide your cloud credentials!');
        process.exit(1);
    }
    
    var pkgcloud = require('pkgcloud');
    var Table = require('cli-table');

    var rackspace = pkgcloud.compute.createClient({
        provider: 'rackspace',
        username: process.env.CF_USERNAME,
        apiKey: process.env.CF_KEY,
        region: process.env.CF_REGION
    });

    var tb = new Table({
        head: [ 'Name', 'Status', 'Internal', 'External', 'LDU']
    });

    rackspace.getServers(function (err, servers) {
        if (err) {
            throw new Error(err);
        }

        // http://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
        servers.sort(function (a, b) {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        servers.forEach(function (server) {
            var internal = server.addresses.private[0].version === 4 ? 
                                server.addresses.private[0].addr : 
                                server.addresses.private[1].addr ;

            var external = server.addresses.public[0].version === 4 ? 
                                server.addresses.public[0].addr : 
                                server.addresses.public[1].addr ;

            tb.push([
                server.name.toLowerCase(),
                server.status,
                internal,
                external,
                server.updated.toString().split('T')[0]
            ]);
        });

        console.log('Rackspace Cloud Servers');
        console.log(tb.toString());
    });
})();

