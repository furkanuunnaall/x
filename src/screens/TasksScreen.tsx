import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { newTaskDay, productOf, taskDefinitions, taskValues } from "../product";
import {
  Button,
  C,
  GameCard,
  Label,
  ProgressBar,
  Shell,
  TopBar,
  s,
} from "../ui";
import { Props } from "../navigation";
export default function TasksScreen({ navigation }: Props<"Tasks">) {
  const { game, dispatch } = useGame(),
    { day } = useDiscovery(),
    t = productOf(game).dailyTasks[day] ?? newTaskDay(),
    values = taskValues(t);
  return (
    <Shell
      header={
        <TopBar title="Günlük görevler" back={() => navigation.goBack()} />
      }
    >
      <View style={{ gap: 4 }}>
        <Label>{day.split("-").reverse().join(".")}</Label>
        <Text style={k.title}>Bugün bir adım daha.</Text>
        <Text style={s.muted}>Her görev +10 Mühür, üçü birden +30 Mühür.</Text>
      </View>
      <View style={{ gap: 10 }}>
        {taskDefinitions.map((task, i) => {
          const done = values[i] >= task.total,
            claimed = t.claimed.includes(i);
          return (
            <GameCard
              key={task.title}
              style={[k.task, { borderColor: done ? C.green : C.line }]}
            >
              <View style={{ flex: 1, gap: 8 }}>
                <View style={s.between}>
                  <Text style={k.taskTitle}>{task.title}</Text>
                  <Text style={k.count}>
                    {Math.min(task.total, values[i])}/{task.total}
                  </Text>
                </View>
                <ProgressBar value={values[i]} total={task.total} />
              </View>
              <Button
                small
                title={claimed ? "✓" : "+10"}
                disabled={claimed || !done}
                onPress={() => dispatch({ type: "task-claim", index: i })}
              />
            </GameCard>
          );
        })}
      </View>
      <GameCard style={k.task}>
        <View style={{ flex: 1, gap: 4 }}>
          <Label>GÜNLÜK ÖDÜL · {t.claimed.length}/3</Label>
          <Text style={k.bonus}>+30 Mühür</Text>
        </View>
        <Button
          small
          title={t.bonus ? "✓ ALINDI" : "ÖDÜLÜ AL"}
          disabled={t.bonus || t.claimed.length !== 3}
          onPress={() => dispatch({ type: "task-bonus" })}
        />
      </GameCard>
      <Text style={s.note}>
        Görevler her gün yenilenir; tekrar oyunları sayılmaz.
      </Text>
    </Shell>
  );
}
const k = StyleSheet.create({
  title: { color: C.ink, fontSize: 24, fontWeight: "800" },
  task: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  taskTitle: { color: C.ink, fontSize: 15, fontWeight: "700", flexShrink: 1 },
  count: { color: C.gold, fontSize: 14, fontWeight: "800" },
  bonus: { color: C.ink, fontSize: 22, fontWeight: "800" },
});
