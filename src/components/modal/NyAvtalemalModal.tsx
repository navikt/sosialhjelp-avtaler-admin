import React, { ForwardedRef, forwardRef } from "react";
import {
  Button,
  FileObject,
  HStack,
  List,
  Modal,
  TextField,
  UNSAFE_Combobox,
  UNSAFE_FileUpload,
  VStack,
} from "@navikt/ds-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { TrashIcon } from "@navikt/aksel-icons";

interface Props {
  submit: (formData: FormData) => void;
}

interface FormValues {
  name: string;
  files: FileObject[];
  map: [string, string][];
}

const options = [
  { label: "Kommunenavn", value: "KOMMUNENAVN" },
  { label: "Kommunens orgnr", value: "KOMMUNEORGNR" },
  { label: "Dato", value: "DATO" },
];
const NyAvtalemalModal = (
  { submit }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const { register, handleSubmit, control, reset, watch, formState } =
    useForm<FormValues>({
      defaultValues: { files: [], map: [["", ""]], name: "" },
    });
  const { fields, append, remove } = useFieldArray({ control, name: "map" });

  console.log(formState.errors);
  const close = () => {
    reset();
    if (typeof ref === "function") {
      ref(null);
    } else {
      ref?.current?.close();
    }
  };
  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    formData.append("file", data.files[0].file, data.files[0].file.name);
    formData.append(
      "metadata",
      JSON.stringify({
        name: data.name,
        replacementMap: Object.fromEntries(data.map),
      }),
    );
    submit(formData);
    close();
  };

  return (
    <Modal ref={ref} header={{ heading: "Ny avtalemal" }} onClose={close}>
      <Modal.Body style={{ width: "700px" }}>
        <form id="ny-avtalemal" onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="4">
            <TextField
              label="Navn"
              error={formState.errors.name?.message}
              {...register("name", { required: "Påkrevd" })}
            />
            <VStack gap="2">
              <Controller
                rules={{
                  required: "Påkrevd",
                  minLength: { value: 1, message: "Må laste opp fil" },
                }}
                render={({ field, fieldState }) => (
                  <UNSAFE_FileUpload.Dropzone
                    label="Last opp avtalemalen her"
                    fileLimit={{ max: 1, current: field.value.length }}
                    multiple={false}
                    accept={".docx"}
                    onSelect={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
                name={"files"}
                control={control}
              />
              {watch("files").map((file) => (
                <UNSAFE_FileUpload.Item
                  key={file.file.name}
                  file={file.file}
                  button={{
                    action: "delete",
                    onClick: () => reset({ files: [] }),
                  }}
                />
              ))}
            </VStack>
            <List title="Erstatninger">
              {fields.map((item, index) => {
                return (
                  <li key={item.id}>
                    <HStack justify="space-between" align="center">
                      <TextField
                        label="verdi"
                        error={formState.errors.map?.[index]?.["0"]?.message}
                        {...register(`map.${index}.0`, { required: "Påkrevd" })}
                      />
                      <Controller
                        name={`map.${index}.1`}
                        control={control}
                        rules={{ required: "Påkrevd" }}
                        render={({ field, fieldState }) => (
                          <UNSAFE_Combobox
                            allowNewValues={false}
                            error={fieldState.error?.message}
                            onToggleSelected={(option, isSelected) => {
                              if (isSelected) {
                                field.onChange(option);
                              } else {
                                field.onChange(undefined);
                              }
                            }}
                            label="hva"
                            options={options}
                          />
                        )}
                      />
                      <Button
                        onClick={() => remove(index)}
                        icon={<TrashIcon />}
                        variant="danger"
                        size={"small"}
                      />
                    </HStack>
                  </li>
                );
              })}
            </List>
            <Button type="button" onClick={() => append([["", ""]])}>
              Ny rad
            </Button>
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" form="ny-avtalemal">
          Kjør på
        </Button>
        <Button type="button" variant="secondary" onClick={close}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default forwardRef<HTMLDialogElement, Props>(NyAvtalemalModal);
