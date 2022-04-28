const isReachable = require('is-reachable')
const path = require('path')
const dockerCompose = require('docker-compose')
const { exec } = require('child_process')

module.exports = async () => {
  console.time('global-setup')

  const isDBReachable = await isReachable('localhost:5432')

  if (!isDBReachable) {
    try {
      await dockerCompose.upAll({
        cwd: path.join(__dirname),
        log: true
      })
    } catch (err) {
      console.error(err)
    }

    try {
      await dockerCompose.exec(
        'postgres-for-test',
        ['sh', '-c', 'until pg_isready ; do sleep 1; done'],
        {
          cwd: path.join(__dirname)
        }
      )
    } catch (err) {
      console.log({ isReadyErr: err })
    }

    try {
      await new Promise((resolve, reject) => {
        const migrate = exec(
          'sequelize-cli db:migrate',
          { env: process.env, cwd: path.join(__dirname, '..') },
          err => (err ? reject(err) : resolve())
        )

        migrate.stdout.pipe(process.stdout)
        migrate.stderr.pipe(process.stderr)
      })
    } catch (err) {
      console.log({ dbMigrateErr: err })
    }

    try {
      await new Promise((resolve, reject) => {
        const migrate = exec(
          'sequelize-cli db:seed:all',
          { env: process.env, cwd: path.join(__dirname, '..') },
          err => (err ? reject(err) : resolve())
        )

        migrate.stdout.pipe(process.stdout)
        migrate.stderr.pipe(process.stderr)
      })
    } catch (err) {
      console.log({ dbSeedErr: err })
    }
  }

  console.timeEnd('global-setup')
}
