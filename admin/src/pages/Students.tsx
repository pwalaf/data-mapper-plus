import {
  useListStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  getListStudentsQueryKey,
} from "@workspace/api-client-react";
import { ResourcePage } from "@/components/schema/ResourcePage";

export default function Students() {
  const { data, isLoading } = useListStudents();
  return (
    <ResourcePage
      resource="students"
      titleKey="students.title"
      subtitleKey="students.subtitle"
      data={data}
      isLoading={isLoading}
      listQueryKey={getListStudentsQueryKey()}
      createMutation={useCreateStudent()}
      updateMutation={useUpdateStudent()}
      deleteMutation={useDeleteStudent()}
    />
  );
}
