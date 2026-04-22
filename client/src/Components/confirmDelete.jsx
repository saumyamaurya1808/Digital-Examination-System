import Swal from "sweetalert2";

export const confirmDelete = async () => {

    const result = await Swal.fire({
        title: "Are you sure?",
        text: "This record will be permanently deleted!",
        icon: "warning",

        width: "320px",

        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",

        confirmButtonColor: "#7c3aed",
        cancelButtonColor: "#d33",

        customClass: {
            popup: "text-sm p-3",
            title: "text-lg",
            htmlContainer: "text-xs",
            confirmButton: "text-xs px-3 py-1",
            cancelButton: "text-xs px-3 py-1"
        }

    });

    return result.isConfirmed;
};