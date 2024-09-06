# Sample Hardhat Project

Gas Optimizations:
To optimize gas usage in the contract, I have minimized the number of stored variables and used mapping instead of arrays where possible. Mapping is more gas-efficient and avoids the need for iterations. I have also combined related functions and avoided unnecessary loops to keep gas consumption low. For example, the updateSharing function is designed to handle sharing efficiently with a well-structured loop.

Security Measures:
The contract uses a custom modifier, onlyOwner, to ensure that only the owner of a note can perform certain actions, such as updating sharing settings or deleting notes. This protects against unauthorized access. I have also implemented checks to verify that the note exists before performing any operations, preventing manipulation of invalid data. By using require to validate all operations and provide clear error messages, I have safeguarded the contract against potential errors and ensured that it functions as intended.

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
