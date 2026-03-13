from difflib import SequenceMatcher

SIMILARITY_THRESHOLD = 0.85


def check_duplicate(
    question_text: str, existing_questions: list[str]
) -> tuple[bool, int | None]:
    """Check if a question is a duplicate of any existing question.

    Uses SequenceMatcher for text similarity comparison.

    Returns:
        Tuple of (is_duplicate, index_of_duplicate_in_list or None)
    """
    for i, existing in enumerate(existing_questions):
        similarity = SequenceMatcher(
            None, question_text.lower(), existing.lower()
        ).ratio()
        if similarity >= SIMILARITY_THRESHOLD:
            return True, i
    return False, None
