import React from "react";
import {
  View,
} from "react-native";
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
      <Label>{day.split("-").reverse().join(".")}</Label>
      <Text style={s.hero}>Bugün bir adım daha.</Text>
      <Text style={s.muted}>
        Her görev +10 Mühür. Üçünü tamamla, +30 Mühür daha kazan.
      </Text>
      {taskDefinitions.map((task, i) => (
        <GameCard
          key={task.title}
          style={{
            gap: 16,
            borderColor: values[i] >= task.total ? C.green : C.line,
          }}
        >
          <View style={s.between}>
            <Text style={s.text}>{task.title}</Text>
            <Text style={s.gold}>
              {Math.min(task.total, values[i])}/{task.total}
            </Text>
          </View>
          <ProgressBar value={values[i]} total={task.total} />
          <Button
            title={t.claimed.includes(i) ? "✓ ÖDÜL ALINDI" : "+10 MÜHÜR AL"}
            disabled={t.claimed.includes(i) || values[i] < task.total}
            onPress={() => dispatch({ type: "task-claim", index: i })}
          />
        </GameCard>
      ))}
      <GameCard style={{ gap: 15 }}>
        <Label>GÜNLÜK ÖDÜL · {t.claimed.length}/3</Label>
        <Text style={s.hero}>+30 Mühür</Text>
        <Button
          title={t.bonus ? "✓ GÜNLÜK ÖDÜL ALINDI" : "GÜNLÜK ÖDÜLÜ AL"}
          disabled={t.bonus || t.claimed.length !== 3}
          onPress={() => dispatch({ type: "task-bonus" })}
        />
      </GameCard>
      <Text style={s.note}>
        Görevler yerel takvim gününde yenilenir. Ana bölümler ve ilk kez çözülen
        günlük bulmacalar sayılır; tekrar oyunları sayılmaz.
      </Text>
    </Shell>
  );
}
