Step to add a research:
1. register a reward 
```javascript
enumHubGoalRewards.reward_example = "reward_example";
```
2. edit getIsUnlocked for the building
```javascript
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(shapez.enumHubGoalRewards.reward_example);
    }
```
3. create key 
```javascript
const research = {
    key: {
        building: typeof MetaBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_example,
        title: string,
        desc: string,
        amount: int,
    }
}
```

4. add research in init() in class MOD
```javascript
this.modInterface.addResearch(research);
```
