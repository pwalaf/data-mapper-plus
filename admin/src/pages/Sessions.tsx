import {
  useListSessions,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  getListSessionsQueryKey,
  useListStudents,
} from "@workspace/api-client-react";
import { ResourcePage } from "@/components/schema/ResourcePage";
import { useMemo } from "react";

export default function Sessions() {
  const { data, isLoading } = useListSessions();
  const { data: students } = useListStudents();

  const studentMap = useMemo(() => {
    const map = new Map<number, string>();
    (students || []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [students]);

  return (
    <ResourcePage
      resource="sessions"
      titleKey="sessions.title"
      subtitleKey="sessions.subtitle"
      data={data}
      isLoading={isLoading}
      listQueryKey={getListSessionsQueryKey()}
      createMutation={useCreateSession()}
      updateMutation={useUpdateSession()}
      deleteMutation={useDeleteSession()}
      buildEditDefaults={(s) => ({ ...s })}
      buildPayload={(raw) => {
        const id = Number(raw.studentId);
        return {
          ...raw,
          studentId: id,
          studentName: studentMap.get(id) ?? "",
        };
      }}
    />
  );
}
