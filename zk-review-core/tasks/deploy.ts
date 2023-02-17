import { task, types } from "hardhat/config"

task("deploy", "Deploy a Greeter contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("group", "Group id", "42", types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress, group: groupId }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = semaphore.address
        }

        const PRFactory = await ethers.getContractFactory("PeerReview")
        console.log('eys')
        const PRContract = await PRFactory.deploy(semaphoreAddress)

        await PRContract.deployed()

        if (logs) {
            console.info(`Greeter contract has been deployed to: ${PRContract.address}`)
        }
        return PRContract
    })
