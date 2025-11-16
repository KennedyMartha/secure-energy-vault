// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PowerUsage - Encrypted Household Power Usage Log
/// @author PowerUsage Contract
/// @notice A contract for storing encrypted household power usage records to protect user privacy
contract PowerUsage is SepoliaConfig {
    /// @notice Structure representing a power usage record
    struct PowerRecord {
        address owner;
        euint32 encryptedUsage; // Encrypted power usage value (kWh)
        uint256 timestamp; // Timestamp when the record was created
        uint256 period; // Period identifier (e.g., day or month)
        bool exists; // Whether this record exists
    }

    /// @notice Mapping from record ID to power usage record
    mapping(uint256 => PowerRecord) private records;

    /// @notice Mapping from user address to their record IDs
    mapping(address => uint256[]) private userRecords;

    /// @notice Counter for generating unique record IDs
    uint256 private nextRecordId;

    /// @notice Events
    event PowerRecordAdded(uint256 indexed recordId, address indexed owner, uint256 timestamp, uint256 period);
    event PowerRecordRetrieved(uint256 indexed recordId, address indexed requester);
    event PowerRecordDecrypted(uint256 indexed recordId, address indexed owner, uint256 decryptedValue);

    /// @notice Initialize the contract
    constructor() {
        nextRecordId = 1;
    }

    /// @notice Add a new power usage record with encrypted value
    /// @param encryptedUsageInput The encrypted power usage value (kWh)
    /// @param inputProof The proof for the encrypted input
    /// @param period The period identifier (e.g., day or month number)
    /// @return recordId The ID of the created record
    function addRecord(
        externalEuint32 encryptedUsageInput,
        bytes calldata inputProof,
        uint256 period
    ) external returns (uint256 recordId) {
        // Validate period parameter
        require(period > 0 && period <= 365, "Period must be between 1 and 365 days");

        euint32 encryptedUsage = FHE.fromExternal(encryptedUsageInput, inputProof);

        recordId = nextRecordId++;

        // Create the power usage record
        records[recordId] = PowerRecord({
            owner: msg.sender,
            encryptedUsage: encryptedUsage,
            timestamp: block.timestamp,
            period: period,
            exists: true
        });

        // Add record ID to user's list
        userRecords[msg.sender].push(recordId);

        // Grant access permissions for decryption with proper error handling
        try FHE.allowThis(encryptedUsage) {
            // Allow contract to access the encrypted value
        } catch {
            // If allowance fails, revert the transaction
            revert("Failed to set contract access permissions");
        }

        try FHE.allow(encryptedUsage, msg.sender) {
            // Allow owner to access the encrypted value
        } catch {
            // If allowance fails, revert the transaction
            revert("Failed to set owner access permissions");
        }

        emit PowerRecordAdded(recordId, msg.sender, block.timestamp, period);
    }

    /// @notice Get the encrypted power usage value for a record
    /// @param recordId The ID of the record
    /// @return encryptedUsage The encrypted power usage value
    function getRecordUsage(uint256 recordId) external view returns (euint32 encryptedUsage) {
        require(records[recordId].exists, "Record does not exist");
        require(records[recordId].owner == msg.sender, "Access denied: not the record owner");
        require(recordId > 0 && recordId <= nextRecordId - 1, "Invalid record ID");
        return records[recordId].encryptedUsage;
    }

    /// @notice Get record metadata (without encrypted value)
    /// @param recordId The ID of the record
    /// @return owner The owner address
    /// @return timestamp The timestamp when the record was created
    /// @return period The period identifier
    function getRecordMetadata(uint256 recordId) external view returns (
        address owner,
        uint256 timestamp,
        uint256 period
    ) {
        require(records[recordId].exists, "Record does not exist");
        PowerRecord storage record = records[recordId];
        return (record.owner, record.timestamp, record.period);
    }

    /// @notice Check if a record exists
    /// @param recordId The ID to check
    /// @return exists Whether the record exists
    function recordExists(uint256 recordId) external view returns (bool exists) {
        return records[recordId].exists;
    }

    /// @notice Get the total number of records created
    /// @return count The total count of records
    function getTotalRecords() external view returns (uint256 count) {
        return nextRecordId - 1;
    }

    /// @notice Get the number of records for a specific user
    /// @param user The address of the user
    /// @return count The number of records for the user
    function getUserRecordCount(address user) external view returns (uint256 count) {
        return userRecords[user].length;
    }

    /// @notice Get all record IDs for a specific user
    /// @param user The address of the user
    /// @return recordIds Array of record IDs belonging to the user
    function getUserRecords(address user) external view returns (uint256[] memory recordIds) {
        return userRecords[user];
    }

    /// @notice Get statistics for a user
    /// @param user The address of the user
    /// @return totalRecords Total number of records
    /// @return totalPeriod Sum of all periods (for averaging)
    function getUserStats(address user) external view returns (uint256 totalRecords, uint256 totalPeriod) {
        uint256[] memory recordIds = userRecords[user];
        totalRecords = recordIds.length;

        for (uint256 i = 0; i < totalRecords; i++) {
            totalPeriod += records[recordIds[i]].period;
        }
    }

    /// @notice Get a specific record ID for a user by index
    /// @param user The address of the user
    /// @param index The index in the user's record list
    /// @return recordId The record ID at the specified index
    function getUserRecordByIndex(address user, uint256 index) external view returns (uint256 recordId) {
        require(index < userRecords[user].length, "Index out of bounds");
        return userRecords[user][index];
    }

    /// @notice Get records within a period range
    /// @param user The address of the user
    /// @param minPeriod Minimum period value (inclusive)
    /// @param maxPeriod Maximum period value (inclusive)
    /// @return recordIds Array of record IDs within the period range
    function getUserRecordsInPeriodRange(
        address user,
        uint256 minPeriod,
        uint256 maxPeriod
    ) external view returns (uint256[] memory recordIds) {
        require(minPeriod <= maxPeriod, "Invalid period range");

        uint256[] memory allRecords = userRecords[user];
        uint256[] memory tempResults = new uint256[](allRecords.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allRecords.length; i++) {
            uint256 recordId = allRecords[i];
            uint256 period = records[recordId].period;
            if (period >= minPeriod && period <= maxPeriod) {
                tempResults[count] = recordId;
                count++;
            }
        }

        // Create properly sized result array
        recordIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            recordIds[i] = tempResults[i];
        }
    }

    /// @notice Get multiple records metadata in batch
    /// @param user The address of the user
    /// @param startIndex Starting index in user's record list
    /// @param count Number of records to retrieve
    /// @return recordIds Array of record IDs
    /// @return timestamps Array of timestamps
    /// @return periods Array of periods
    function getUserRecordsBatch(
        address user,
        uint256 startIndex,
        uint256 count
    ) external view returns (
        uint256[] memory recordIds,
        uint256[] memory timestamps,
        uint256[] memory periods
    ) {
        uint256[] memory allRecords = userRecords[user];
        require(startIndex < allRecords.length, "Start index out of bounds");

        uint256 actualCount = count;
        if (startIndex + count > allRecords.length) {
            actualCount = allRecords.length - startIndex;
        }

        recordIds = new uint256[](actualCount);
        timestamps = new uint256[](actualCount);
        periods = new uint256[](actualCount);

        for (uint256 i = 0; i < actualCount; i++) {
            uint256 recordId = allRecords[startIndex + i];
            PowerRecord storage record = records[recordId];
            recordIds[i] = recordId;
            timestamps[i] = record.timestamp;
            periods[i] = record.period;
        }
    }
}


